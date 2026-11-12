// 사진을 Cloudflare R2(S3 호환 저장소)에 올리고 공개 주소를 돌려준다. DB 에는 이 주소만 저장
import { randomUUID } from "node:crypto";
import { AwsClient } from "aws4fetch";

const { R2_ACCOUNT_ID, R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY, R2_BUCKET, R2_PUBLIC_URL } = process.env;

// 키가 없어도 서버는 뜨게 둔다 (사진 올리기만 안 됨)
const r2 = R2_ACCOUNT_ID && R2_ACCESS_KEY_ID && R2_SECRET_ACCESS_KEY && R2_BUCKET && R2_PUBLIC_URL
  ? new AwsClient({ accessKeyId: R2_ACCESS_KEY_ID, secretAccessKey: R2_SECRET_ACCESS_KEY, service: "s3", region: "auto" })
  : null;

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

export const isImageUploadReady = () => r2 !== null;

// 이 사용자가 우리 저장소에 올린 사진 주소인지 (다른 사이트 주소나 남의 사진 경로는 저장하지 않음)
export const isOwnImageUrl = (url, folder, userId) =>
  r2 !== null && typeof url === "string" && url.startsWith(`${R2_PUBLIC_URL.replace(/\/$/, "")}/${folder}/${userId}/`)
  && !url.includes("..");

// 이 사용자가 올린 사진들을 R2 에서 지움 (우리 저장소 주소가 아니면 건너뜀). 실패해도 사진만 남으니 기록만 하고 넘어감
export async function deleteImages(urls, folder, userId) {
  const base = `${R2_PUBLIC_URL?.replace(/\/$/, "")}/`;
  await Promise.all(urls.filter((url) => isOwnImageUrl(url, folder, userId)).map(async (url) => {
    const res = await r2.fetch(`https://${R2_ACCOUNT_ID}.r2.cloudflarestorage.com/${R2_BUCKET}/${url.slice(base.length)}`, { method: "DELETE" });
    if (!res.ok && res.status !== 404) console.error("R2 사진 삭제 실패", res.status, url);
  }).map((p) => p.catch((e) => console.error("R2 사진 삭제 실패", e))));
}

// folder/사용자id/무작위이름.확장자 로 저장 → 이름이 겹치지 않고, 누가 올렸는지 경로로 알 수 있음
export async function uploadImage(buf, { type, ext }, folder, userId) {
  const key = `${folder}/${userId}/${randomUUID()}.${ext}`;
  const res = await r2.fetch(`https://${R2_ACCOUNT_ID}.r2.cloudflarestorage.com/${R2_BUCKET}/${key}`, {
    method: "PUT",
    body: buf,
    headers: { "Content-Type": type },
  });
  if (!res.ok) throw new Error(`R2 업로드 실패 ${res.status}: ${await res.text()}`);
  return `${R2_PUBLIC_URL.replace(/\/$/, "")}/${key}`;
}
