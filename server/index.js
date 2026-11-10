// fridgeO API 서버 (Neon Postgres + Neon Auth). 실행: npm run server (.env 필요, .env.example 참고)
// 브라우저는 Vite 프록시(/api)를 거쳐 이 서버를 호출하고, DB 비밀번호(DATABASE_URL)는 이 서버에만 있다.
import { createServer } from "node:http";
import { neon } from "@neondatabase/serverless";
import { createRemoteJWKSet, jwtVerify } from "jose";

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

async function readJson(req) {
  let raw = "";
  for await (const chunk of req) {
    raw += chunk;
    if (raw.length > MAX_BODY) throw new HttpError(413, "요청이 너무 큽니다");
  }
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

// "METHOD /path" → 처리 함수. 모든 경로는 로그인 필요 (user = 검증된 JWT payload)
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
};

createServer(async (req, res) => {
  const send = (status, body) => {
    res.writeHead(status, { "Content-Type": "application/json; charset=utf-8" });
    res.end(JSON.stringify(body));
  };
  try {
    const { pathname } = new URL(req.url, "http://localhost");
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
