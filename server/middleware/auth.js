// Authorization: Bearer <JWT> 를 검증해 로그인 사용자(payload.sub = neon_auth.user.id)를 c.get("user") 로 넣는다
import { createRemoteJWKSet, jwtVerify } from "jose";
import { HttpError } from "../lib/http.js";

// Neon Auth 문서: JWT 서명키는 <Auth URL>/.well-known/jwks.json. isolate 안에서 한 번만 만들어 재사용
const jwksByUrl = new Map();
export function jwksFor(env) {
  const url = env.VITE_NEON_AUTH_URL;
  if (!jwksByUrl.has(url)) jwksByUrl.set(url, createRemoteJWKSet(new URL(`${url}/.well-known/jwks.json`)));
  return jwksByUrl.get(url);
}

// 실패하면 null
async function getAuthUser(c) {
  const token = c.req.header("authorization")?.match(/^Bearer (.+)$/)?.[1];
  if (!token) return null;
  const origin = new URL(c.env.VITE_NEON_AUTH_URL).origin; // issuer·audience 는 Auth URL 의 origin
  try {
    const { payload } = await jwtVerify(token, jwksFor(c.env), { algorithms: ["EdDSA"], issuer: origin, audience: origin });
    return payload;
  } catch {
    return null;
  }
}

// 로그인 필수. 없으면 401
export async function requireAuth(c, next) {
  const user = await getAuthUser(c);
  if (!user) throw new HttpError(401, "로그인이 필요합니다");
  c.set("user", user);
  await next();
}

// 로그인은 선택. 토큰이 없거나 틀리면 user = null
export async function optionalAuth(c, next) {
  c.set("user", await getAuthUser(c));
  await next();
}
