// 레시피: 분류, 목록·검색, 추천, 상세, 작성·수정·삭제
import { Hono } from "hono";
import { HttpError, idParam, readJson } from "../lib/http.js";
import { deleteImages, isImageUploadReady, isOwnImageUrl } from "../lib/imageUpload.js";
import { ensureProfile } from "../lib/profile.js";
import { optionalAuth, requireAuth } from "../middleware/auth.js";

const RECIPE_PAGE = 10;
const NOT_FOUND = "레시피를 찾을 수 없습니다";

// 레시피 작성·수정 본문 검사. 사진은 이 사용자가 우리 저장소(R2)에 올린 주소만 받음
export function parseRecipe(body, user, env) {
  const text = (value, label, max, required = false) => {
    const s = typeof value === "string" ? value.trim() : "";
    if (required && !s) throw new HttpError(400, `${label}을(를) 입력하세요`);
    if (s.length > max) throw new HttpError(400, `${label}은(는) ${max}자 이하로 입력하세요`);
    return s || null;
  };
  const int = (value, label, max) => {
    if (value === null || value === undefined || value === "") return null;
    const n = Number(value);
    if (!Number.isInteger(n) || n < 1 || n > max) throw new HttpError(400, `${label}은(는) 1~${max} 사이 숫자로 입력하세요`);
    return n;
  };
  const list = (value, label, max) => {
    if (!Array.isArray(value) || value.length < 1) throw new HttpError(400, `${label}을(를) 1개 이상 입력하세요`);
    if (value.length > max) throw new HttpError(400, `${label}은(는) ${max}개까지 입력할 수 있어요`);
    return value;
  };

  const title = text(body.title, "제목", 50, true);
  const description = text(body.description, "소개", 500);
  const categoryId = int(body.categoryId, "분류", Number.MAX_SAFE_INTEGER);
  const servings = int(body.servings, "인분", 20);
  const cookTime = int(body.cookTime, "조리 시간(분)", 600);
  const difficulty = body.difficulty || null;
  if (difficulty !== null && !["쉬움", "보통", "어려움"].includes(difficulty)) throw new HttpError(400, "난이도가 올바르지 않습니다");
  const imageUrl = body.imageUrl || null;
  if (imageUrl !== null && !isOwnImageUrl(env, imageUrl, "recipes", user.sub)) throw new HttpError(400, "사진 주소가 올바르지 않습니다");
  const ingredients = list(body.ingredients, "재료", 50).map((item) => ({
    name: text(item?.name, "재료 이름", 30, true),
    amount: text(item?.amount, "재료 양", 30),
  }));
  const steps = list(body.steps, "만드는 순서", 30).map((step, i) => {
    const stepImage = step?.imageUrl || null;
    if (stepImage !== null && !isOwnImageUrl(env, stepImage, "recipes", user.sub)) throw new HttpError(400, `${i + 1}단계 사진 주소가 올바르지 않습니다`);
    return { text: text(step?.text, "만드는 순서", 500, true), image_url: stepImage };
  });

  return { title, description, imageUrl, categoryId, servings, cookTime, difficulty, ingredients, steps };
}

const recipes = new Hono();

// 레시피 분류 목록
recipes.get("/api/categories", async (c) => {
  return c.json(await c.get("sql")`SELECT id, name, icon_url FROM categories ORDER BY id`);
});

// 레시피 목록 (무한 스크롤). cursor = 지난 페이지 마지막 id, 응답의 nextCursor 가 null 이면 끝
// category = 분류 id (없으면 전체)
recipes.get("/api/recipes", async (c) => {
  const sql = c.get("sql");
  const params = new URL(c.req.url).searchParams;
  const cursor = Number(params.get("cursor") ?? 0);
  if (!Number.isSafeInteger(cursor) || cursor < 0) throw new HttpError(400, "cursor 가 올바르지 않습니다");
  const category = params.has("category") ? Number(params.get("category")) : null;
  if (category !== null && (!Number.isSafeInteger(category) || category < 1)) {
    throw new HttpError(400, "category 가 올바르지 않습니다");
  }
  // q = 검색어 (제목 또는 재료 이름에 포함). %, _, \ 는 글자 그대로 찾도록 escape
  const q = params.get("q")?.trim() || null;
  if (q && q.length > 50) throw new HttpError(400, "검색어는 50자 이하로 입력하세요");
  const pattern = q && `%${q.replace(/[\\%_]/g, "\\$&")}%`;
  // 한 개 더 가져와서 다음 페이지가 있는지 확인
  const rows = await sql`
    SELECT r.id, r.title, r.image_url, u.name AS author, s.review_count, s.rating
    FROM recipes r
    LEFT JOIN users u ON u.id = r.user_id
    CROSS JOIN LATERAL (
      SELECT count(*)::int AS review_count, round(avg(rating), 1)::float AS rating
      FROM reviews WHERE recipe_id = r.id
    ) s
    WHERE r.id > ${cursor}
      AND (${category}::bigint IS NULL OR r.category_id = ${category})
      AND (${q}::text IS NULL
           OR r.title ILIKE ${pattern}
           OR EXISTS (SELECT 1 FROM recipe_ingredients i WHERE i.recipe_id = r.id AND i.name ILIKE ${pattern}))
    ORDER BY r.id
    LIMIT ${RECIPE_PAGE + 1}`;
  const items = rows.slice(0, RECIPE_PAGE);
  return c.json({ items, nextCursor: rows.length > RECIPE_PAGE ? Number(items.at(-1).id) : null });
});

// 메인 추천 레시피 5개. 로그인했으면 내 냉장고 재료(수량 > 0)가 들어가는 레시피를 기한 급한 재료 순으로 먼저,
// 모자라면(또는 로그인 안 했으면) 별점·리뷰 많은 순으로 채움. reason = 이 레시피에 쓰이는 내 재료 이름
// shortcut: 레시피마다 재료를 ILIKE 로 맞춰 봄 (레시피 160개 기준 충분), 수천 개가 되면 재료 사전 id 로 연결할 것
recipes.get("/api/recipes/recommend", optionalAuth, async (c) => {
  const userId = c.get("user")?.sub ?? null;
  return c.json(await c.get("sql")`
    WITH mine AS (
      SELECT c.name, min(i.expiry_date) AS expiry_date
      FROM ingredients i JOIN ingredient_catalog c ON c.id = i.catalog_id
      WHERE i.user_id = ${userId}::uuid AND i.quantity > 0
      GROUP BY c.name
    )
    SELECT r.id, r.title, r.image_url, m.name AS reason, s.review_count, s.rating
    FROM recipes r
    LEFT JOIN LATERAL (
      SELECT mine.name, mine.expiry_date FROM recipe_ingredients ri
      JOIN mine ON ri.name ILIKE '%' || mine.name || '%'
      WHERE ri.recipe_id = r.id
      ORDER BY mine.expiry_date NULLS LAST LIMIT 1
    ) m ON true
    CROSS JOIN LATERAL (
      SELECT count(*)::int AS review_count, round(avg(rating), 1)::float AS rating
      FROM reviews WHERE recipe_id = r.id
    ) s
    ORDER BY m.name IS NULL,
             -- 한 재료에 몰리지 않게: 재료마다 별점 제일 좋은 레시피 1개씩 먼저 (기한 급한 재료부터)
             row_number() OVER (PARTITION BY m.name ORDER BY s.rating DESC NULLS LAST, s.review_count DESC, r.id),
             m.expiry_date NULLS LAST, s.rating DESC NULLS LAST, s.review_count DESC, r.id
    LIMIT 5`);
});

// 레시피 상세: 기본 정보 + 리뷰 통계 + 재료 + 만드는 순서(recipe_steps)
// 공개 주소지만 로그인 토큰이 같이 오면 내 북마크 여부와 재료별 내 냉장고에 있는지(in_fridge)도 알려 줌 (토큰 없거나 틀리면 false)
recipes.get("/api/recipes/:id{[0-9]+}", optionalAuth, async (c) => {
  const sql = c.get("sql");
  const id = idParam(c, NOT_FOUND);
  const [recipe] = await sql`
    SELECT r.id, r.title, r.description, r.image_url, r.servings, r.cook_time, r.difficulty, r.category_id, r.user_id,
           u.name AS author, s.review_count, s.rating, s.positive_count
    FROM recipes r
    LEFT JOIN users u ON u.id = r.user_id
    CROSS JOIN LATERAL (
      SELECT count(*)::int AS review_count, round(avg(rating), 1)::float AS rating,
             count(*) FILTER (WHERE rating >= 4)::int AS positive_count
      FROM reviews WHERE recipe_id = r.id
    ) s
    WHERE r.id = ${id}`;
  if (!recipe) throw new HttpError(404, NOT_FOUND);
  const user = c.get("user");
  const userId = user?.sub ?? null;
  const [ingredients, steps, [mark], [follow]] = await Promise.all([
    // 재료 이름은 공백을 빼고 같으면 같은 재료 ("소 금" = "소금"), 수량 0(다 떨어짐)은 없는 것으로
    sql`
      SELECT ri.name, ri.amount,
             EXISTS (
               SELECT 1 FROM ingredients i JOIN ingredient_catalog c ON c.id = i.catalog_id
               WHERE i.user_id = ${userId}::uuid AND i.quantity > 0
                 AND replace(c.name, ' ', '') = replace(ri.name, ' ', '')
             ) AS in_fridge
      FROM recipe_ingredients ri WHERE ri.recipe_id = ${id} ORDER BY ri.position`,
    sql`SELECT position, text, image_url FROM recipe_steps WHERE recipe_id = ${id} ORDER BY position`,
    user ? sql`SELECT 1 FROM recipe_bookmarks WHERE user_id = ${user.sub} AND recipe_id = ${id}` : [],
    user ? sql`SELECT 1 FROM follows WHERE user_id = ${user.sub} AND following_id = ${recipe.user_id}` : [],
  ]);
  // mine = 로그인한 계정이 작성자인지 (화면의 "수정" 버튼용. 실제 권한 확인은 PUT 에서 다시 함). 작성자 id 는 내보내지 않음
  const { user_id: authorId, ...rest } = recipe;
  return c.json({ ...rest, ingredients, steps, bookmarked: Boolean(mark), following: Boolean(follow), mine: userId !== null && authorId === userId });
});

// 레시피 작성. 레시피·재료·순서를 SQL 한 문장으로 넣어 중간에 실패해도 반쪽 레시피가 남지 않음. 응답 { id }
recipes.post("/api/recipes", requireAuth, async (c) => {
  const sql = c.get("sql");
  const user = c.get("user");
  const { title, description, imageUrl, categoryId, servings, cookTime, difficulty, ingredients, steps } =
    parseRecipe(await readJson(c, 60_000), user, c.env); // 순서가 많으면 10KB 를 넘을 수 있음
  await ensureProfile(sql, user);
  try {
    const [recipe] = await sql`
      WITH r AS (
        INSERT INTO recipes (title, description, image_url, user_id, category_id, servings, cook_time, difficulty)
        VALUES (${title}, ${description}, ${imageUrl}, ${user.sub}, ${categoryId}, ${servings}, ${cookTime}, ${difficulty})
        RETURNING id
      ), i AS (
        INSERT INTO recipe_ingredients (recipe_id, position, name, amount)
        SELECT r.id, t.ord, t.name, t.amount
        FROM r, ROWS FROM (jsonb_to_recordset(${JSON.stringify(ingredients)}::jsonb) AS (name text, amount text)) WITH ORDINALITY AS t(name, amount, ord)
      ), s AS (
        INSERT INTO recipe_steps (recipe_id, position, text, image_url)
        SELECT r.id, t.ord, t.text, t.image_url
        FROM r, ROWS FROM (jsonb_to_recordset(${JSON.stringify(steps)}::jsonb) AS (text text, image_url text)) WITH ORDINALITY AS t(text, image_url, ord)
      )
      SELECT id FROM r`;
    return c.json({ id: Number(recipe.id) });
  } catch (e) {
    if (e.code === "23503") throw new HttpError(400, "없는 분류입니다"); // 없는 category_id
    throw e;
  }
});

// 레시피 수정: 로그인한 계정(JWT sub)이 작성자(recipes.user_id)일 때만. 재료·순서는 통째로 바꿔 넣음
// shortcut: 바꾸거나 뺀 예전 사진은 R2 에 남음, 저장 공간이 문제가 되면 지울 것
recipes.put("/api/recipes/:id{[0-9]+}", requireAuth, async (c) => {
  const sql = c.get("sql");
  const user = c.get("user");
  const id = idParam(c, NOT_FOUND);
  const [owner] = await sql`SELECT user_id FROM recipes WHERE id = ${id}`;
  if (!owner) throw new HttpError(404, NOT_FOUND);
  if (owner.user_id !== user.sub) throw new HttpError(403, "내가 쓴 레시피만 수정할 수 있어요");
  const { title, description, imageUrl, categoryId, servings, cookTime, difficulty, ingredients, steps } =
    parseRecipe(await readJson(c, 60_000), user, c.env);
  // 한 트랜잭션: 중간에 실패하면 전부 취소. 모든 문장에 작성자 조건을 다시 걸어 둠
  try {
    await sql.transaction([
      sql`UPDATE recipes SET title = ${title}, description = ${description}, image_url = ${imageUrl}, category_id = ${categoryId},
                 servings = ${servings}, cook_time = ${cookTime}, difficulty = ${difficulty}
          WHERE id = ${id} AND user_id = ${user.sub}`,
      sql`DELETE FROM recipe_ingredients WHERE recipe_id = ${id} AND EXISTS (SELECT 1 FROM recipes WHERE id = ${id} AND user_id = ${user.sub})`,
      sql`DELETE FROM recipe_steps WHERE recipe_id = ${id} AND EXISTS (SELECT 1 FROM recipes WHERE id = ${id} AND user_id = ${user.sub})`,
      sql`INSERT INTO recipe_ingredients (recipe_id, position, name, amount)
          SELECT ${id}, t.ord, t.name, t.amount
          FROM ROWS FROM (jsonb_to_recordset(${JSON.stringify(ingredients)}::jsonb) AS (name text, amount text)) WITH ORDINALITY AS t(name, amount, ord)
          WHERE EXISTS (SELECT 1 FROM recipes WHERE id = ${id} AND user_id = ${user.sub})`,
      sql`INSERT INTO recipe_steps (recipe_id, position, text, image_url)
          SELECT ${id}, t.ord, t.text, t.image_url
          FROM ROWS FROM (jsonb_to_recordset(${JSON.stringify(steps)}::jsonb) AS (text text, image_url text)) WITH ORDINALITY AS t(text, image_url, ord)
          WHERE EXISTS (SELECT 1 FROM recipes WHERE id = ${id} AND user_id = ${user.sub})`,
    ]);
  } catch (e) {
    if (e.code === "23503") throw new HttpError(400, "없는 분류입니다");
    throw e;
  }
  return c.json({ id });
});

// 레시피 삭제: 로그인한 계정이 작성자일 때만. 재료·순서·리뷰·북마크는 DB 가 같이 지움(ON DELETE CASCADE), 사진은 R2 에서 지움
recipes.delete("/api/recipes/:id{[0-9]+}", requireAuth, async (c) => {
  const sql = c.get("sql");
  const user = c.get("user");
  const id = idParam(c, NOT_FOUND);
  const [owner] = await sql`SELECT user_id FROM recipes WHERE id = ${id}`;
  if (!owner) throw new HttpError(404, NOT_FOUND);
  if (owner.user_id !== user.sub) throw new HttpError(403, "내가 쓴 레시피만 삭제할 수 있어요");
  const images = await sql`
    SELECT image_url FROM recipes WHERE id = ${id} AND image_url IS NOT NULL
    UNION ALL SELECT image_url FROM recipe_steps WHERE recipe_id = ${id} AND image_url IS NOT NULL`;
  const [deleted] = await sql`DELETE FROM recipes WHERE id = ${id} AND user_id = ${user.sub} RETURNING id`;
  if (!deleted) throw new HttpError(404, NOT_FOUND);
  if (isImageUploadReady(c.env)) await deleteImages(c.env, images.map((row) => row.image_url), "recipes", user.sub);
  return c.json({ ok: true });
});

export default recipes;
