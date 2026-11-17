// 레시피에 붙는 사용자 활동: 리뷰, 북마크, 작성자 팔로우
import { Hono } from "hono";
import { HttpError, idParam, readJson } from "../lib/http.js";
import { ensureProfile } from "../lib/profile.js";
import { requireAuth } from "../middleware/auth.js";

const REVIEW_PAGE = 5;
const NOT_FOUND = "레시피를 찾을 수 없습니다";

// 팔로우할 레시피 작성자 id. 작성자가 없거나(초기 데이터·탈퇴) 나 자신이면 오류
async function authorIdToFollow(c) {
  const [recipe] = await c.get("sql")`SELECT user_id FROM recipes WHERE id = ${idParam(c, NOT_FOUND)}`;
  if (!recipe?.user_id) throw new HttpError(404, "작성자를 찾을 수 없습니다");
  if (recipe.user_id === c.get("user").sub) throw new HttpError(400, "내가 쓴 레시피예요");
  return recipe.user_id;
}

const reviews = new Hono();

// 이 레시피의 리뷰 목록 (로그인 불필요). 내용 있는 리뷰 먼저, 그다음 최신순. offset = 이미 받은 개수, nextOffset 이 null 이면 끝
// shortcut: OFFSET 페이지라 리뷰가 아주 많아지면 느려짐, 그때 (created_at, id) 커서로 교체
reviews.get("/api/recipes/:id{[0-9]+}/reviews", async (c) => {
  const recipeId = idParam(c, NOT_FOUND);
  const offset = Number(c.req.query("offset") ?? 0);
  if (!Number.isSafeInteger(offset) || offset < 0) throw new HttpError(400, "offset 이 올바르지 않습니다");
  const rows = await c.get("sql")`
    SELECT r.id, r.rating, r.comment, r.created_at, u.name AS author, u.profile_image_url
    FROM reviews r
    LEFT JOIN users u ON u.id = r.user_id
    WHERE r.recipe_id = ${recipeId}
    ORDER BY (r.comment IS NULL), r.created_at DESC, r.id DESC
    LIMIT ${REVIEW_PAGE + 1} OFFSET ${offset}`;
  return c.json({ items: rows.slice(0, REVIEW_PAGE), nextOffset: rows.length > REVIEW_PAGE ? offset + REVIEW_PAGE : null });
});

// 이 레시피에 내가 쓴 리뷰 (없으면 null). 레시피당 한 사람 1개 (reviews UNIQUE(user_id, recipe_id))
reviews.get("/api/recipes/:id{[0-9]+}/review", requireAuth, async (c) => {
  const [review] = await c.get("sql")`
    SELECT rating, comment, created_at FROM reviews WHERE user_id = ${c.get("user").sub} AND recipe_id = ${idParam(c, NOT_FOUND)}`;
  return c.json(review ?? null);
});

// 리뷰 작성·수정 (이미 있으면 덮어씀)
reviews.put("/api/recipes/:id{[0-9]+}/review", requireAuth, async (c) => {
  const sql = c.get("sql");
  const user = c.get("user");
  const recipeId = idParam(c, NOT_FOUND);
  const body = await readJson(c);
  const rating = Number(body.rating);
  if (!Number.isInteger(rating) || rating < 1 || rating > 5) throw new HttpError(400, "별점은 1~5점으로 골라 주세요");
  const comment = typeof body.comment === "string" ? body.comment.trim() : "";
  if (comment.length > 1000) throw new HttpError(400, "리뷰는 1000자 이하로 입력하세요");
  await ensureProfile(sql, user);
  try {
    const [review] = await sql`
      INSERT INTO reviews (user_id, recipe_id, rating, comment)
      VALUES (${user.sub}, ${recipeId}, ${rating}, ${comment || null})
      ON CONFLICT (user_id, recipe_id) DO UPDATE SET rating = EXCLUDED.rating, comment = EXCLUDED.comment
      RETURNING rating, comment, created_at`;
    return c.json(review);
  } catch (e) {
    if (e.code === "23503") throw new HttpError(404, NOT_FOUND); // 없는 recipe_id
    throw e;
  }
});

// 내 리뷰 삭제
reviews.delete("/api/recipes/:id{[0-9]+}/review", requireAuth, async (c) => {
  await c.get("sql")`DELETE FROM reviews WHERE user_id = ${c.get("user").sub} AND recipe_id = ${idParam(c, NOT_FOUND)}`;
  return c.json({ ok: true });
});

// 북마크 추가 (이미 있으면 그대로 → 여러 번 눌러도 안전)
reviews.put("/api/recipes/:id{[0-9]+}/bookmark", requireAuth, async (c) => {
  const sql = c.get("sql");
  const user = c.get("user");
  const recipeId = idParam(c, NOT_FOUND);
  await ensureProfile(sql, user);
  try {
    await sql`INSERT INTO recipe_bookmarks (user_id, recipe_id) VALUES (${user.sub}, ${recipeId}) ON CONFLICT (user_id, recipe_id) DO NOTHING`;
  } catch (e) {
    if (e.code === "23503") throw new HttpError(404, NOT_FOUND); // 없는 recipe_id
    throw e;
  }
  return c.json({ bookmarked: true });
});

// 북마크 해제
reviews.delete("/api/recipes/:id{[0-9]+}/bookmark", requireAuth, async (c) => {
  await c.get("sql")`DELETE FROM recipe_bookmarks WHERE user_id = ${c.get("user").sub} AND recipe_id = ${idParam(c, NOT_FOUND)}`;
  return c.json({ bookmarked: false });
});

// 레시피 작성자 팔로우 (이미 팔로우 중이면 그대로 → 여러 번 눌러도 안전). 작성자 id 는 화면에 내보내지 않아 레시피 id 로 받음
reviews.put("/api/recipes/:id{[0-9]+}/follow", requireAuth, async (c) => {
  const sql = c.get("sql");
  const user = c.get("user");
  const authorId = await authorIdToFollow(c);
  await ensureProfile(sql, user);
  await sql`INSERT INTO follows (user_id, following_id) VALUES (${user.sub}, ${authorId}) ON CONFLICT (user_id, following_id) DO NOTHING`;
  return c.json({ following: true });
});

// 팔로우 해제
reviews.delete("/api/recipes/:id{[0-9]+}/follow", requireAuth, async (c) => {
  const authorId = await authorIdToFollow(c);
  await c.get("sql")`DELETE FROM follows WHERE user_id = ${c.get("user").sub} AND following_id = ${authorId}`;
  return c.json({ following: false });
});

export default reviews;
