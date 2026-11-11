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
async function readBody(req) {
  const chunks = [];
  let size = 0;
  for await (const chunk of req) {
    size += chunk.length;
    if (size > MAX_BODY) throw new HttpError(413, "요청이 너무 큽니다");
    chunks.push(chunk);
  }
  return Buffer.concat(chunks);
}

async function readJson(req) {
  const raw = (await readBody(req)).toString("utf8");
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
  // 내 프로필
  async "GET /api/me"(req, user) {
    const [me] = await sql`SELECT id, name, profile_image_url, created_at FROM users WHERE id = ${user.sub}`;
    if (!me) throw new HttpError(404, "프로필이 없습니다");
    return me;
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
};

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
    // /api/recipes/123, /api/recipes/123/review(s)·bookmark 처럼 숫자 id 가 붙은 주소는 routes 의 ":id" 키로 찾는다
    const pathname = new URL(req.url, "http://localhost").pathname.replace(/^(\/api\/recipes)\/\d+(\/reviews?|\/bookmark)?$/, "$1/:id$2");
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
