// fridgeO API 서버 (Neon Postgres + Neon Auth). 실행: npm run server (.env 필요, .env.example 참고)
// 브라우저는 Vite 프록시(/api)를 거쳐 이 서버를 호출하고, DB 비밀번호(DATABASE_URL)는 이 서버에만 있다.
import { createServer } from "node:http";
import { neon } from "@neondatabase/serverless";
import { createRemoteJWKSet, jwtVerify } from "jose";
import { sendSms, toKoreanNumber, verifyNeonWebhook } from "./otpWebhook.js";

const { DATABASE_URL, VITE_NEON_AUTH_URL, PORT = 3001 } = process.env;
if (!DATABASE_URL || !VITE_NEON_AUTH_URL) {
  throw new Error(".env 에 DATABASE_URL, VITE_NEON_AUTH_URL 을 설정하세요 (.env.example 참고)");
}

const sql = neon(DATABASE_URL);
// Neon Auth 문서: JWT 서명키는 <Auth URL>/.well-known/jwks.json, issuer·audience는 Auth URL의 origin
const JWKS = createRemoteJWKSet(new URL(`${VITE_NEON_AUTH_URL}/.well-known/jwks.json`));
const AUTH_ORIGIN = new URL(VITE_NEON_AUTH_URL).origin;
const MAX_BODY = 10_000;
const PROFILE_IMAGE_MAX = 150_000; // 프로필 사진 data URL 최대 글자 수 (브라우저에서 160px 로 줄이면 보통 10~20KB)

// Authorization: Bearer <JWT> 를 검증해 로그인 사용자(payload.sub = neon_auth.user.id)를 돌려준다. 실패하면 null
async function getAuthUser(req) {
  const token = req.headers.authorization?.match(/^Bearer (.+)$/)?.[1];
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, JWKS, {
      algorithms: ["EdDSA"],
      issuer: AUTH_ORIGIN,
      audience: AUTH_ORIGIN,
    });
    return payload;
  } catch {
    return null;
  }
}

// 본문 원본 바이트 (웹훅 서명 검증은 파싱 전 원본이 필요)
async function readBody(req, limit = MAX_BODY) {
  const chunks = [];
  let size = 0;
  for await (const chunk of req) {
    size += chunk.length;
    if (size > limit) throw new HttpError(413, "요청이 너무 큽니다");
    chunks.push(chunk);
  }
  return Buffer.concat(chunks);
}

// limit 는 기본 10KB. 프로필 사진처럼 큰 본문을 받는 곳만 늘려 줌
async function readJson(req, limit) {
  const raw = (await readBody(req, limit)).toString("utf8");
  if (!raw) return {};
  try {
    return JSON.parse(raw);
  } catch {
    throw new HttpError(400, "JSON 형식이 아닙니다");
  }
}

class HttpError extends Error {
  constructor(status, message) {
    super(message);
    this.status = status;
  }
}

// 닉네임: 앞뒤 공백 제거 후 1~20자
function parseName(value) {
  if (value === undefined) return undefined;
  const name = typeof value === "string" ? value.trim() : "";
  if (name.length < 1 || name.length > 20) throw new HttpError(400, "닉네임은 1~20자로 입력하세요");
  return name;
}

// "METHOD /path" → 처리 함수. 로그인 필요 (user = 검증된 JWT payload). 로그인 없는 경로는 아래 publicRoutes
const routes = {
  // 내 프로필 + 마이페이지 숫자 (북마크·팔로잉·팔로워 수)
  async "GET /api/me"(req, user) {
    const [me] = await sql`
      SELECT id, name, profile_image_url, created_at,
             (SELECT count(*)::int FROM recipe_bookmarks WHERE user_id = u.id) AS bookmark_count,
             (SELECT count(*)::int FROM follows WHERE user_id = u.id) AS following_count,
             (SELECT count(*)::int FROM follows WHERE following_id = u.id) AS follower_count,
             -- 유통기한 임박(5일 이하, 지난 것 포함) 내 재료. 알림 기준과 같음
             (SELECT COALESCE(json_agg(json_build_object(
                       'id', i.id, 'name', COALESCE(c.name, '재료'), 'expiry_date', to_char(i.expiry_date, 'YYYY-MM-DD'))
                     ORDER BY i.expiry_date, i.id), '[]')
              FROM ingredients i LEFT JOIN ingredient_catalog c ON c.id = i.catalog_id
              WHERE i.user_id = u.id
                AND i.expiry_date <= (now() AT TIME ZONE 'Asia/Seoul')::date + ${EXPIRY_ALERT_DAYS}::int) AS urgent_ingredients
      FROM users u WHERE id = ${user.sub}`;
    if (!me) throw new HttpError(404, "프로필이 없습니다");
    return me;
  },
  // 프로필 사진 바꾸기. 파일 저장소가 없어 브라우저에서 작게 줄인 사진을 data URL 글자로 받아 그대로 저장
  // shortcut: data URL 을 users 행에 저장 (약 10KB), 파일 저장소(S3·R2 등)가 생기면 업로드 후 주소만 저장
  async "PATCH /api/me"(req, user) {
    const { profileImage } = await readJson(req, PROFILE_IMAGE_MAX + 1_000);
    if (profileImage !== null) {
      const ok = typeof profileImage === "string" && profileImage.length <= PROFILE_IMAGE_MAX
        && /^data:image\/(jpeg|png|webp);base64,[A-Za-z0-9+/]+=*$/.test(profileImage);
      if (!ok) throw new HttpError(400, "사진은 150KB 이하의 JPG·PNG·WEBP 만 올릴 수 있어요");
    }
    await ensureProfile(user);
    const [me] = await sql`UPDATE users SET profile_image_url = ${profileImage} WHERE id = ${user.sub} RETURNING profile_image_url`;
    return me;
  },
  // 내가 북마크한 레시피 (최근 저장한 순)
  async "GET /api/me/bookmarks"(req, user) {
    return sql`
      SELECT r.id, r.title, r.image_url
      FROM recipe_bookmarks b JOIN recipes r ON r.id = b.recipe_id
      WHERE b.user_id = ${user.sub}
      ORDER BY b.created_at DESC
      LIMIT 50`;
  },
  // 팔로우 현황. type=following(내가 팔로우한 사람, 기본) | followers(나를 팔로우한 사람)
  async "GET /api/me/follows"(req, user) {
    const type = new URL(req.url, "http://localhost").searchParams.get("type") ?? "following";
    if (type !== "following" && type !== "followers") throw new HttpError(400, "type 이 올바르지 않습니다");
    return type === "following"
      ? sql`SELECT u.id, u.name, u.profile_image_url FROM follows f JOIN users u ON u.id = f.following_id
            WHERE f.user_id = ${user.sub} ORDER BY f.created_at DESC LIMIT 100`
      : sql`SELECT u.id, u.name, u.profile_image_url FROM follows f JOIN users u ON u.id = f.user_id
            WHERE f.following_id = ${user.sub} ORDER BY f.created_at DESC LIMIT 100`;
  },
  // 가입·로그인 직후 프로필 행을 만든다(이미 있으면 그대로). 닉네임이 없으면 가입 때 이름 사용
  async "POST /api/me"(req, user) {
    const name = parseName((await readJson(req)).name) ?? user.name ?? "사용자";
    await sql`INSERT INTO users (id, name) VALUES (${user.sub}, ${name}) ON CONFLICT (id) DO NOTHING`;
    const [me] = await sql`SELECT id, name, profile_image_url, created_at FROM users WHERE id = ${user.sub}`;
    return me;
  },
  // 이 레시피에 내가 쓴 리뷰 (없으면 null). 레시피당 한 사람 1개 (reviews UNIQUE(user_id, recipe_id))
  async "GET /api/recipes/:id/review"(req, user) {
    const [review] = await sql`
      SELECT rating, comment, created_at FROM reviews WHERE user_id = ${user.sub} AND recipe_id = ${recipeIdOf(req)}`;
    return review ?? null;
  },
  // 리뷰 작성·수정 (이미 있으면 덮어씀)
  async "PUT /api/recipes/:id/review"(req, user) {
    const recipeId = recipeIdOf(req);
    const body = await readJson(req);
    const rating = Number(body.rating);
    if (!Number.isInteger(rating) || rating < 1 || rating > 5) throw new HttpError(400, "별점은 1~5점으로 골라 주세요");
    const comment = typeof body.comment === "string" ? body.comment.trim() : "";
    if (comment.length > 1000) throw new HttpError(400, "리뷰는 1000자 이하로 입력하세요");
    await ensureProfile(user);
    try {
      const [review] = await sql`
        INSERT INTO reviews (user_id, recipe_id, rating, comment)
        VALUES (${user.sub}, ${recipeId}, ${rating}, ${comment || null})
        ON CONFLICT (user_id, recipe_id) DO UPDATE SET rating = EXCLUDED.rating, comment = EXCLUDED.comment
        RETURNING rating, comment, created_at`;
      return review;
    } catch (e) {
      if (e.code === "23503") throw new HttpError(404, "레시피를 찾을 수 없습니다"); // 없는 recipe_id
      throw e;
    }
  },
  // 내 리뷰 삭제
  async "DELETE /api/recipes/:id/review"(req, user) {
    await sql`DELETE FROM reviews WHERE user_id = ${user.sub} AND recipe_id = ${recipeIdOf(req)}`;
    return { ok: true };
  },
  // 북마크 추가 (이미 있으면 그대로 → 여러 번 눌러도 안전)
  async "PUT /api/recipes/:id/bookmark"(req, user) {
    const recipeId = recipeIdOf(req);
    await ensureProfile(user);
    try {
      await sql`INSERT INTO recipe_bookmarks (user_id, recipe_id) VALUES (${user.sub}, ${recipeId}) ON CONFLICT (user_id, recipe_id) DO NOTHING`;
    } catch (e) {
      if (e.code === "23503") throw new HttpError(404, "레시피를 찾을 수 없습니다"); // 없는 recipe_id
      throw e;
    }
    return { bookmarked: true };
  },
  // 북마크 해제
  async "DELETE /api/recipes/:id/bookmark"(req, user) {
    await sql`DELETE FROM recipe_bookmarks WHERE user_id = ${user.sub} AND recipe_id = ${recipeIdOf(req)}`;
    return { bookmarked: false };
  },
  // 내 냉장고 재료 (무한 스크롤). sort = expiry(기본)|name|storage, q = 재료 이름 검색, offset = 이미 받은 개수
  // shortcut: OFFSET 페이지라 한 사람 재료가 수천 개가 되면 느려짐, 그때 정렬 기준별 커서로 교체
  async "GET /api/ingredients"(req, user) {
    const params = new URL(req.url, "http://localhost").searchParams;
    const sort = params.get("sort") ?? "expiry";
    if (!["expiry", "name", "storage"].includes(sort)) throw new HttpError(400, "sort 가 올바르지 않습니다");
    const offset = Number(params.get("offset") ?? 0);
    if (!Number.isSafeInteger(offset) || offset < 0) throw new HttpError(400, "offset 이 올바르지 않습니다");
    const q = params.get("q")?.trim() || null;
    if (q && q.length > 30) throw new HttpError(400, "검색어는 30자 이하로 입력하세요");
    const pattern = q && `%${q.replace(/[\\%_]/g, "\\$&")}%`;
    // 날짜는 시간대 영향 없게 'YYYY-MM-DD' 글자로, 수량은 1.50 → 1.5 처럼 끝 0 제거
    const rows = await sql`
      SELECT i.id, c.name, c.image_url, trim_scale(i.quantity)::text AS quantity, i.unit, i.storage,
             to_char(i.expiry_date, 'YYYY-MM-DD') AS expiry_date
      FROM ingredients i
      LEFT JOIN ingredient_catalog c ON c.id = i.catalog_id
      WHERE i.user_id = ${user.sub} AND (${pattern}::text IS NULL OR c.name ILIKE ${pattern})
      ORDER BY
        CASE WHEN ${sort} = 'name' THEN c.name END,
        CASE WHEN ${sort} = 'storage' THEN array_position(ARRAY['냉장', '냉동', '실온'], i.storage) END,
        i.expiry_date NULLS LAST, i.id
      LIMIT ${INGREDIENT_PAGE + 1} OFFSET ${offset}`;
    return { items: rows.slice(0, INGREDIENT_PAGE), nextOffset: rows.length > INGREDIENT_PAGE ? offset + INGREDIENT_PAGE : null };
  },
  // 내 냉장고에 재료 추가
  async "POST /api/ingredients"(req, user) {
    const input = parseIngredient(await readJson(req));
    await ensureProfile(user);
    const catalogId = await catalogIdFor(input.name);
    const [row] = await sql`
      INSERT INTO ingredients (user_id, catalog_id, quantity, unit, storage, expiry_date)
      VALUES (${user.sub}, ${catalogId}, ${input.quantity}, ${input.unit}, ${input.storage}, ${input.expiryDate})
      RETURNING id`;
    return { id: row.id };
  },
  // 내 재료 하나 (편집 화면용). 다른 사람 재료는 없는 것처럼 404
  async "GET /api/ingredients/:id"(req, user) {
    const [row] = await sql`
      SELECT i.id, c.name, trim_scale(i.quantity)::text AS quantity, i.unit, i.storage,
             to_char(i.expiry_date, 'YYYY-MM-DD') AS expiry_date
      FROM ingredients i
      LEFT JOIN ingredient_catalog c ON c.id = i.catalog_id
      WHERE i.id = ${ingredientIdOf(req)} AND i.user_id = ${user.sub}`;
    if (!row) throw new HttpError(404, "재료를 찾을 수 없습니다");
    return row;
  },
  // 내 재료 수정 (추가와 같은 검사)
  async "PATCH /api/ingredients/:id"(req, user) {
    const id = ingredientIdOf(req);
    const input = parseIngredient(await readJson(req));
    const catalogId = await catalogIdFor(input.name);
    // 고치기 전 기한(old)과 비교해 기한이 바뀌었는지도 함께 돌려받음
    const rows = await sql`
      UPDATE ingredients i
      SET catalog_id = ${catalogId}, quantity = ${input.quantity}, unit = ${input.unit},
          storage = ${input.storage}, expiry_date = ${input.expiryDate}
      FROM (SELECT id, expiry_date FROM ingredients WHERE id = ${id} AND user_id = ${user.sub} FOR UPDATE) old
      WHERE i.id = old.id
      RETURNING i.id, old.expiry_date IS DISTINCT FROM i.expiry_date AS expiry_changed`;
    if (rows.length === 0) throw new HttpError(404, "재료를 찾을 수 없습니다");
    // 기한이 바뀌면 예전 날짜로 만든 유통기한 알림을 지움 → 다음 알림 조회 때 새 날짜로 다시 판단
    if (rows[0].expiry_changed) await sql`DELETE FROM notifications WHERE type = 'expiry' AND ingredient_id = ${id}`;
    return { id: rows[0].id };
  },
  // 내 알림 목록 + 안 읽은 수. 먼저 기한 5일 이하(지난 것 포함)인데 알림이 없는 내 재료의 유통기한 알림을 만든다
  // (재료당 하나: notifications_expiry_once 인덱스라 동시에 불러도 중복 없음, 지운 알림도 행이 남아 다시 안 생김)
  // shortcut: 따로 도는 예약 작업이 없어 목록을 볼 때 만듦, 푸시 알림이 필요해지면 매일 도는 작업으로 옮길 것
  async "GET /api/notifications"(req, user) {
    await sql`
      INSERT INTO notifications (user_id, type, message, ingredient_id)
      SELECT i.user_id, 'expiry', COALESCE(c.name, '재료') || '의 유통기한이 ' || to_char(i.expiry_date, 'YYYY-MM-DD') || '까지예요', i.id
      FROM ingredients i
      LEFT JOIN ingredient_catalog c ON c.id = i.catalog_id
      WHERE i.user_id = ${user.sub}
        AND i.expiry_date <= (now() AT TIME ZONE 'Asia/Seoul')::date + ${EXPIRY_ALERT_DAYS}::int
      ON CONFLICT (ingredient_id) WHERE type = 'expiry' DO NOTHING`;
    const items = await sql`
      SELECT n.id, n.type, n.message, n.created_at, n.read_at IS NOT NULL AS read,
             to_char(i.expiry_date, 'YYYY-MM-DD') AS expiry_date
      FROM notifications n
      LEFT JOIN ingredients i ON i.id = n.ingredient_id
      WHERE n.user_id = ${user.sub} AND n.dismissed_at IS NULL
      ORDER BY n.created_at DESC, i.expiry_date NULLS LAST, n.id DESC -- 한 번에 생긴 알림끼리는 기한 급한 것부터
      LIMIT 50`;
    return { items, unread: items.filter((n) => !n.read).length };
  },
  // 알림센터를 열면 모두 읽음
  async "POST /api/notifications/read"(req, user) {
    await sql`UPDATE notifications SET read_at = now() WHERE user_id = ${user.sub} AND read_at IS NULL`;
    return { ok: true };
  },
  // 전체삭제: 행은 남기고 지운 시각만 적음 (지우면 같은 재료 알림이 다음 조회 때 다시 생기므로)
  async "DELETE /api/notifications"(req, user) {
    await sql`UPDATE notifications SET dismissed_at = now(), read_at = COALESCE(read_at, now()) WHERE user_id = ${user.sub} AND dismissed_at IS NULL`;
    return { ok: true };
  },
  // 내 재료 삭제 (다른 사람 재료는 user_id 조건에 걸려 지워지지 않음)
  async "DELETE /api/ingredients/:id"(req, user) {
    const rows = await sql`DELETE FROM ingredients WHERE id = ${ingredientIdOf(req)} AND user_id = ${user.sub} RETURNING id`;
    if (rows.length === 0) throw new HttpError(404, "재료를 찾을 수 없습니다");
    return { ok: true };
  },
};

// /api/ingredients/<id> 주소에서 재료 id
function ingredientIdOf(req) {
  const id = Number(new URL(req.url, "http://localhost").pathname.split("/")[3]);
  if (!Number.isSafeInteger(id) || id < 1) throw new HttpError(404, "재료를 찾을 수 없습니다");
  return id;
}

// 재료 추가·수정 입력 검사 → { name, quantity, unit, storage, expiryDate }
function parseIngredient(body) {
  const name = typeof body.name === "string" ? body.name.trim() : "";
  if (name.length < 1 || name.length > 30) throw new HttpError(400, "재료 이름은 1~30자로 입력하세요");
  const quantity = Number(body.quantity);
  if (!Number.isFinite(quantity) || quantity <= 0 || quantity > 9999) throw new HttpError(400, "수량은 0보다 크고 9999 이하로 입력하세요");
  const unit = typeof body.unit === "string" && body.unit.trim() ? body.unit.trim().slice(0, 10) : "개";
  if (!["냉장", "냉동", "실온"].includes(body.storage)) throw new HttpError(400, "보관 방법을 골라 주세요");
  const expiryDate = body.expiryDate || null;
  if (expiryDate !== null && !isDateKey(expiryDate)) throw new HttpError(400, "유통기한 날짜가 올바르지 않습니다");
  return { name, quantity, unit, storage: body.storage, expiryDate };
}

// ingredients 에는 이름 칸이 없어서, 이름으로 재료 사전(ingredient_catalog)을 찾고 없으면 등록한 뒤 그 id
// (DO UPDATE 로 두어야 이미 있는 이름일 때도 RETURNING 이 기존 행을 돌려줌)
async function catalogIdFor(name) {
  const [catalog] = await sql`
    INSERT INTO ingredient_catalog (name) VALUES (${name})
    ON CONFLICT (name) DO UPDATE SET name = EXCLUDED.name
    RETURNING id`;
  return catalog.id;
}

// "YYYY-MM-DD" 이고 실제로 있는 날짜인지. 2026-02-30 은 3월로 넘어가 원래 글자와 달라지고, 2026-13-01 은 NaN
function isDateKey(value) {
  if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const time = Date.parse(`${value}T00:00:00Z`);
  return !Number.isNaN(time) && new Date(time).toISOString().startsWith(value);
}

// 프로필 행이 아직 없으면(가입 직후 POST /api/me 실패 등) 만들어 둔다 → reviews·recipe_bookmarks 의 user_id 외래키 통과
async function ensureProfile(user) {
  await sql`INSERT INTO users (id, name) VALUES (${user.sub}, ${user.name ?? "사용자"}) ON CONFLICT (id) DO NOTHING`;
}

// /api/recipes/<id>/... 주소에서 레시피 id
function recipeIdOf(req) {
  const id = Number(new URL(req.url, "http://localhost").pathname.split("/")[3]);
  if (!Number.isSafeInteger(id) || id < 1) throw new HttpError(404, "레시피를 찾을 수 없습니다");
  return id;
}

// Neon 재시도(같은 event_id)로 문자가 두 번 가지 않게, 보낸 이벤트를 10분간 기억
// shortcut: 메모리 보관이라 서버 재시작·여러 대 실행 시 중복 가능, 그때 DB 테이블로 옮길 것
const sentOtpEvents = new Set();

const RECIPE_PAGE = 10;
const REVIEW_PAGE = 5;
const INGREDIENT_PAGE = 10;
const EXPIRY_ALERT_DAYS = 5; // 남은 기한이 이 일수 이하면 유통기한 알림 (냉장고 화면의 빨간 배지 기준과 같음)

// 로그인 없이 호출되는 경로. 대신 각자 요청을 검증한다
const publicRoutes = {
  // 레시피 분류 목록
  async "GET /api/categories"() {
    return sql`SELECT id, name, icon_url FROM categories ORDER BY id`;
  },
  // 레시피 목록 (무한 스크롤). cursor = 지난 페이지 마지막 id, 응답의 nextCursor 가 null 이면 끝
  // category = 분류 id (없으면 전체)
  async "GET /api/recipes"(req) {
    const params = new URL(req.url, "http://localhost").searchParams;
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
    return { items, nextCursor: rows.length > RECIPE_PAGE ? Number(items.at(-1).id) : null };
  },
  // 레시피 상세: 기본 정보 + 리뷰 통계 + 재료 + 만드는 순서(recipe_steps)
  async "GET /api/recipes/:id"(req) {
    const id = Number(new URL(req.url, "http://localhost").pathname.split("/").pop());
    if (!Number.isSafeInteger(id)) throw new HttpError(404, "레시피를 찾을 수 없습니다");
    const [recipe] = await sql`
      SELECT r.id, r.title, r.description, r.image_url, r.servings, r.cook_time, r.difficulty,
             u.name AS author, s.review_count, s.rating, s.positive_count
      FROM recipes r
      LEFT JOIN users u ON u.id = r.user_id
      CROSS JOIN LATERAL (
        SELECT count(*)::int AS review_count, round(avg(rating), 1)::float AS rating,
               count(*) FILTER (WHERE rating >= 4)::int AS positive_count
        FROM reviews WHERE recipe_id = r.id
      ) s
      WHERE r.id = ${id}`;
    if (!recipe) throw new HttpError(404, "레시피를 찾을 수 없습니다");
    // 공개 주소지만 로그인 토큰이 같이 오면 내 북마크 여부도 알려 줌 (토큰 없거나 틀리면 false)
    const user = await getAuthUser(req);
    const [ingredients, steps, [mark]] = await Promise.all([
      sql`SELECT name, amount FROM recipe_ingredients WHERE recipe_id = ${id} ORDER BY position`,
      sql`SELECT position, text, image_url FROM recipe_steps WHERE recipe_id = ${id} ORDER BY position`,
      user ? sql`SELECT 1 FROM recipe_bookmarks WHERE user_id = ${user.sub} AND recipe_id = ${id}` : [],
    ]);
    return { ...recipe, ingredients, steps, bookmarked: Boolean(mark) };
  },
  // 이 레시피의 리뷰 목록. 내용 있는 리뷰 먼저, 그다음 최신순. offset = 이미 받은 개수, nextOffset 이 null 이면 끝
  // shortcut: OFFSET 페이지라 리뷰가 아주 많아지면 느려짐, 그때 (created_at, id) 커서로 교체
  async "GET /api/recipes/:id/reviews"(req) {
    const recipeId = recipeIdOf(req);
    const offset = Number(new URL(req.url, "http://localhost").searchParams.get("offset") ?? 0);
    if (!Number.isSafeInteger(offset) || offset < 0) throw new HttpError(400, "offset 이 올바르지 않습니다");
    const rows = await sql`
      SELECT r.id, r.rating, r.comment, r.created_at, u.name AS author, u.profile_image_url
      FROM reviews r
      LEFT JOIN users u ON u.id = r.user_id
      WHERE r.recipe_id = ${recipeId}
      ORDER BY (r.comment IS NULL), r.created_at DESC, r.id DESC
      LIMIT ${REVIEW_PAGE + 1} OFFSET ${offset}`;
    return { items: rows.slice(0, REVIEW_PAGE), nextOffset: rows.length > REVIEW_PAGE ? offset + REVIEW_PAGE : null };
  },
  // Neon Auth send.otp 웹훅 → Solapi 문자 발송. Neon 콘솔 Auth > Webhooks 에 이 주소(HTTPS)를 등록
  async "POST /api/webhooks/neon"(req) {
    const raw = await readBody(req);
    let event;
    try {
      event = await verifyNeonWebhook(raw, req.headers, JWKS);
    } catch {
      throw new HttpError(401, "웹훅 서명이 올바르지 않습니다");
    }
    // 이메일 인증번호는 Neon이 직접 보낸다. 문자(전화번호 플러그인)만 처리
    if (event.event_type !== "send.otp" || event.event_data?.delivery_preference === "email") return { ok: true };
    if (sentOtpEvents.has(event.event_id)) return { ok: true };

    // 문서상 번호 위치가 명시돼 있지 않아 두 곳을 확인한다
    const to = toKoreanNumber(event.event_data?.phone_number ?? event.user?.phone_number);
    if (!to) {
      // 인증번호는 남기지 않고 필드 이름만 기록 (번호 위치 확인용)
      console.warn("send.otp 에 국내 휴대폰 번호 없음", Object.keys(event.event_data ?? {}), Object.keys(event.user ?? {}));
      throw new HttpError(422, "문자를 보낼 전화번호가 없습니다");
    }

    sentOtpEvents.add(event.event_id);
    try {
      await sendSms(to, `[fridgeO] 인증번호는 ${event.event_data.otp_code} 입니다.`);
    } catch (e) {
      sentOtpEvents.delete(event.event_id); // 실패하면 Neon 재시도 때 다시 보낼 수 있게
      throw e;
    }
    setTimeout(() => sentOtpEvents.delete(event.event_id), 10 * 60_000).unref();
    return { ok: true };
  },
};

createServer(async (req, res) => {
  const send = (status, body) => {
    res.writeHead(status, { "Content-Type": "application/json; charset=utf-8" });
    res.end(JSON.stringify(body));
  };
  try {
    // /api/recipes/123(/review(s)·/bookmark), /api/ingredients/123 처럼 숫자 id 가 붙은 주소는 routes 의 ":id" 키로 찾는다
    const pathname = new URL(req.url, "http://localhost").pathname
      .replace(/^(\/api\/recipes)\/\d+(\/reviews?|\/bookmark)?$/, "$1/:id$2")
      .replace(/^(\/api\/ingredients)\/\d+$/, "$1/:id");
    const publicHandler = publicRoutes[`${req.method} ${pathname}`];
    if (publicHandler) return send(200, await publicHandler(req));
    const handler = routes[`${req.method} ${pathname}`];
    if (!handler) return send(404, { error: "없는 주소입니다" });
    const user = await getAuthUser(req);
    if (!user) return send(401, { error: "로그인이 필요합니다" });
    send(200, await handler(req, user));
  } catch (e) {
    if (e instanceof HttpError) return send(e.status, { error: e.message });
    console.error(e);
    send(500, { error: "서버 오류" });
  }
}).listen(PORT, () => console.log(`API: http://localhost:${PORT}`));
