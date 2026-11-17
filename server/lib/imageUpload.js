// 사진을 Cloudflare R2 에 올리고 공개 주소를 돌려준다. DB 에는 이 주소만 저장
// env.IMAGES = R2 바인딩(wrangler.toml), env.R2_PUBLIC_URL = 버킷 공개 주소
import { randomUUID } from "node:crypto";

export const IMAGE_MAX = 2_000_000; // 2MB. 브라우저에서 1200px 로 줄이면 보통 200~400KB

// 파일 앞 몇 바이트로 진짜 종류를 확인 (요청 헤더의 Content-Type 은 믿지 않음). 사진이 아니면 null
export function imageTypeOf(buf) {
  if (buf.length >= 3 && buf[0] === 0xff && buf[1] === 0xd8 && buf[2] === 0xff) return { type: "image/jpeg", ext: "jpg" };
  if (buf.length >= 8 && buf.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]))) {
    return { type: "image/png", ext: "png" };
  }
  if (buf.length >= 12 && buf.toString("latin1", 0, 4) === "RIFF" && buf.toString("latin1", 8, 12) === "WEBP") {
    return { type: "image/webp", ext: "webp" };
  }
  return null;
}

// 키가 없어도 서버는 뜨게 둔다 (사진 올리기만 안 됨)
export const isImageUploadReady = (env) => Boolean(env.IMAGES && env.R2_PUBLIC_URL);

const publicBase = (env) => `${env.R2_PUBLIC_URL.replace(/\/$/, "")}/`;

// 이 사용자가 우리 저장소에 올린 사진 주소인지. 저장 이름은 <uuid>.<확장자> 뿐이라 그 모양만 받는다
// (다른 사이트 주소, 남의 사진 경로, `..`·`%2e%2e` 같은 경로 이동은 모두 모양이 달라 거절됨)
export function isOwnImageUrl(env, url, folder, userId) {
  if (!isImageUploadReady(env) || typeof url !== "string") return false;
  const prefix = `${publicBase(env)}${folder}/${userId}/`;
  return url.startsWith(prefix) && /^[0-9a-f-]{36}\.(jpg|png|webp)$/.test(url.slice(prefix.length));
}

// 이 사용자가 올린 사진들을 R2 에서 지움 (우리 저장소 주소가 아니면 건너뜀). 실패해도 사진만 남으니 기록만 하고 넘어감
export async function deleteImages(env, urls, folder, userId) {
  const keys = urls.filter((url) => isOwnImageUrl(env, url, folder, userId)).map((url) => url.slice(publicBase(env).length));
  if (keys.length === 0) return;
  try {
    await env.IMAGES.delete(keys);
  } catch (e) {
    console.error("R2 사진 삭제 실패", e);
  }
}

// folder/사용자id/무작위이름.확장자 로 저장 → 이름이 겹치지 않고, 누가 올렸는지 경로로 알 수 있음
export async function uploadImage(env, buf, { type, ext }, folder, userId) {
  const key = `${folder}/${userId}/${randomUUID()}.${ext}`;
  await env.IMAGES.put(key, buf, { httpMetadata: { contentType: type } });
  return `${publicBase(env)}${key}`;
}
