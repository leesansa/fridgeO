# server/db

DB 구조는 Drizzle 로 관리한다. 서버 코드(`server/routes` 등)는 Drizzle 을 쓰지 않고 SQL 을 직접 쓴다. 스키마와 마이그레이션 용도로만 쓴다.

```
server/
  drizzle.config.js  drizzle-kit 설정
  db/
    schema.ts        테이블 구조의 원본. 구조를 바꿀 때 여기를 고친다
    migrations/      schema.ts 변경으로 생성된 SQL (직접 고치지 않음)
                     0000 = 처음 DB 를 읽어 만든 기준 파일 (전부 주석이라 아무것도 실행하지 않음)
    seeds/           데이터 넣는 SQL. condiments.sql 은 scripts/condiments.mjs 가 만든다
    archive/         Drizzle 이전에 손으로 쓰던 스키마 (참고용, 실행하지 않음)
```

## 구조를 바꾸는 방법
1. `server/db/schema.ts` 를 고친다.
2. `npm run db:generate -- --name 변경이름` 으로 `server/db/migrations/` 에 SQL 을 만들고, 내용이 의도한 것인지 읽어 본다.
3. `npm run db:migrate` 로 DB(.env 의 DATABASE_URL)에 적용한다. 운영 DB 에 쓰는 작업이니 SQL 을 확인한 뒤 실행할 것.

`neon_auth` 스키마는 Neon 이 관리하므로 건드리지 않는다 (`server/drizzle.config.js` 의 `schemaFilter`).
