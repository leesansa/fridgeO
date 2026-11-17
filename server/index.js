// fridgeO API 서버 (Cloudflare Workers + Hono, Neon Postgres + Neon Auth). 실행: npm run server (wrangler dev), 배포: npm run deploy:server
// 브라우저는 Vite 프록시(/api)를 거쳐 이 서버를 호출하고, DB 비밀번호(DATABASE_URL)는 이 서버에만 있다.
import { Hono } from "hono";
import { cors } from "hono/cors";
import { HttpError } from "./lib/http.js";
import { db } from "./middleware/db.js";
import images from "./routes/images.js";
import ingredients from "./routes/ingredients.js";
import me from "./routes/me.js";
import notifications from "./routes/notifications.js";
import recipes from "./routes/recipes.js";
import reviews from "./routes/reviews.js";
import signup from "./routes/signup.js";
import webhooks from "./routes/webhooks.js";

const app = new Hono();

// 프런트(Cloudflare Pages)가 다른 주소라 브라우저 요청을 허용. 허용 주소는 wrangler.toml 의 CORS_ORIGINS (쉼표로 구분)
// DB 연결보다 먼저 두어 사전 요청(OPTIONS)이 DB 를 건드리지 않게 함. 로컬은 Vite 프록시라 같은 주소여서 필요 없음
app.use("/api/*", (c, next) =>
  cors({ origin: c.env.CORS_ORIGINS?.split(",") ?? [], allowHeaders: ["Authorization", "Content-Type"], allowMethods: ["GET", "POST", "PUT", "PATCH", "DELETE"], maxAge: 86400 })(c, next));
app.use("/api/*", db);
for (const routes of [me, recipes, reviews, ingredients, notifications, images, signup, webhooks]) app.route("/", routes);

app.notFound((c) => c.json({ error: "없는 주소입니다" }, 404));
app.onError((e, c) => {
  if (e instanceof HttpError) return c.json({ error: e.message }, e.status);
  console.error(e);
  return c.json({ error: "서버 오류" }, 500);
});

export default app;
