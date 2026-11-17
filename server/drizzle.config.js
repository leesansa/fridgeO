// DB 스키마·마이그레이션 관리용 (drizzle-kit 전용, 서버 코드는 쓰지 않음). 사용법: package.json 의 db:* 스크립트
import { defineConfig } from "drizzle-kit";

try {
  process.loadEnvFile(".env"); // DATABASE_URL
} catch {
  // .env 가 없으면 환경 변수에 이미 있다고 보고 넘어감
}

export default defineConfig({
  dialect: "postgresql",
  schema: "./server/db/schema.ts",
  out: "./server/db/migrations",
  schemaFilter: ["public"], // neon_auth 스키마는 Neon 이 관리하므로 건드리지 않음
  dbCredentials: { url: process.env.DATABASE_URL },
});
