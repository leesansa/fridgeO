// 요청마다 DB 연결 함수를 c.get("sql") 로 쓰게 넣어 준다. 비밀값은 Workers 의 env 에서 읽음 (wrangler secret / .dev.vars)
import { neon } from "@neondatabase/serverless";

export async function db(c, next) {
  const { DATABASE_URL, VITE_NEON_AUTH_URL } = c.env;
  if (!DATABASE_URL || !VITE_NEON_AUTH_URL) {
    throw new Error("DATABASE_URL, VITE_NEON_AUTH_URL 을 설정하세요 (wrangler secret 또는 .dev.vars)");
  }
  c.set("sql", neon(DATABASE_URL));
  await next();
}
