// 사진 올리기: 본문 = 사진 파일 그대로 (JSON 아님). R2 에 저장하고 { url } 을 돌려줌 → 레시피 등에 이 주소를 저장
import { Hono } from "hono";
import { HttpError, readBody } from "../lib/http.js";
import { IMAGE_MAX, imageTypeOf, isImageUploadReady, uploadImage } from "../lib/imageUpload.js";
import { requireAuth } from "../middleware/auth.js";

const images = new Hono();

images.post("/api/images", requireAuth, async (c) => {
  if (!isImageUploadReady(c.env)) throw new HttpError(503, "사진 저장소가 설정되지 않았습니다 (wrangler.toml 의 R2 설정 확인)");
  const buf = await readBody(c, IMAGE_MAX);
  const kind = imageTypeOf(buf);
  if (!kind) throw new HttpError(400, "JPG·PNG·WEBP 사진만 올릴 수 있어요");
  return c.json({ url: await uploadImage(c.env, buf, kind, "recipes", c.get("user").sub) });
});

export default images;
