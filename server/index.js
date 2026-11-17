// fridgeO API 서버 (Cloudflare Workers + Hono, Neon Postgres + Neon Auth). 실행: npm run server (wrangler dev), 배포: npm run deploy:server
// 브라우저는 Vite 프록시(/api)를 거쳐 이 서버를 호출하고, DB 비밀번호(DATABASE_URL)는 이 서버에만 있다.
import { Hono } from "hono";
import { HttpError } from "./lib/http.js";
import { db } from "./middleware/db.js";
import images from "./routes/images.js";
import ingredients from "./routes/ingredients.js";
import me from "./routes/me.js";
import notifications from "./routes/notifications.js";
import recipes from "./routes/recipes.js";
import reviews from "./routes/reviews.js";
import webhooks from "./routes/webhooks.js";

const app = new Hono();

app.use("/api/*", db);
for (const routes of [me, recipes, reviews, ingredients, notifications, images, webhooks]) app.route("/", routes);

app.notFound((c) => c.json({ error: "없는 주소입니다" }, 404));
app.onError((e, c) => {
  if (e instanceof HttpError) return c.json({ error: e.message }, e.status);
  console.error(e);
  return c.json({ error: "서버 오류" }, 500);
});

export default app;
