import { getSession } from "./auth";

const MAX_PX = 1200; // 긴 변 기준. 화면 폭(최대 430px)의 2배 남짓이라 선명하고 용량은 수백 KB

// 고른 사진을 긴 변 1200px JPEG 로 줄여 서버(POST /api/images → R2)에 올리고 공개 주소를 돌려줌
// 사용: const url = await uploadImage(input.files[0]);  → 레시피 저장 때 image_url 로 보냄
export async function uploadImage(file) {
  const bitmap = await createImageBitmap(file);
  const scale = Math.min(1, MAX_PX / Math.max(bitmap.width, bitmap.height));
  const canvas = document.createElement("canvas");
  canvas.width = Math.round(bitmap.width * scale);
  canvas.height = Math.round(bitmap.height * scale);
  canvas.getContext("2d").drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  bitmap.close();
  const blob = await new Promise((resolve) => canvas.toBlob(resolve, "image/jpeg", 0.85));

  const token = (await getSession())?.session.token;
  const res = await fetch("/api/images", {
    method: "POST",
    headers: { "Content-Type": "image/jpeg", ...(token && { Authorization: `Bearer ${token}` }) },
    body: blob,
  });
  const data = await res.json().catch(() => null);
  if (!res.ok) throw new Error(data?.error ?? "사진을 올리지 못했습니다");
  return data.url;
}
