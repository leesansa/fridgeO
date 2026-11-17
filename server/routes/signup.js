// 회원가입 1단계: 이메일이 이미 가입돼 있는지 (로그인 불필요). Neon Auth 에는 조회만 하는 API 가 없어 neon_auth.user 를 직접 봄
// shortcut: 요청 횟수 제한 없음 (가입 시도로도 같은 정보가 나옴), 남용되면 Cloudflare Rate Limiting 추가
import { Hono } from "hono";
import { HttpError, readJson } from "../lib/http.js";

const signup = new Hono();

signup.post("/api/signup/check-email", async (c) => {
  const { email } = await readJson(c);
  if (typeof email !== "string" || !/^[^\s@]+@[^\s@]+$/.test(email.trim()) || email.length > 254) {
    throw new HttpError(400, "이메일 형식이 올바르지 않습니다.");
  }
  const sql = c.get("sql");
  const [taken] = await sql`SELECT 1 FROM neon_auth."user" WHERE lower(email) = lower(${email.trim()}) LIMIT 1`;
  return c.json({ available: !taken });
});

export default signup;
