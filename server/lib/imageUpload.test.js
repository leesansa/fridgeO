import assert from "node:assert/strict";
import { test } from "node:test";
import { imageTypeOf, isOwnImageUrl } from "./imageUpload.js";

test("사진 종류는 파일 앞부분으로 판단", () => {
  assert.equal(imageTypeOf(Buffer.from([0xff, 0xd8, 0xff, 0xe0])).type, "image/jpeg");
  assert.equal(imageTypeOf(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0])).type, "image/png");
  assert.equal(imageTypeOf(Buffer.from("RIFF\0\0\0\0WEBPVP8 ", "latin1")).type, "image/webp");
  assert.equal(imageTypeOf(Buffer.from("<svg onload=alert(1)>")), null);
  assert.equal(imageTypeOf(Buffer.alloc(0)), null);
});

test("내가 올린 사진 주소만 인정 (경로 이동·남의 폴더·다른 사이트는 거절)", () => {
  const env = { IMAGES: {}, R2_PUBLIC_URL: "https://img.example.com/" };
  const me = "11111111-1111-1111-1111-111111111111";
  const file = "22222222-2222-2222-2222-222222222222.jpg";
  const ok = (url) => isOwnImageUrl(env, url, "recipes", me);
  assert.equal(ok(`https://img.example.com/recipes/${me}/${file}`), true);
  assert.equal(ok(`https://img.example.com/recipes/${me}/%2e%2e/other/${file}`), false);
  assert.equal(ok(`https://img.example.com/recipes/${me}/../other/${file}`), false);
  assert.equal(ok(`https://img.example.com/recipes/other/${file}`), false);
  assert.equal(ok(`https://evil.example.com/recipes/${me}/${file}`), false);
  assert.equal(isOwnImageUrl({}, `https://img.example.com/recipes/${me}/${file}`, "recipes", me), false); // 저장소 미설정
});
