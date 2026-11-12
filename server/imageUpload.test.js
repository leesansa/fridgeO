import assert from "node:assert/strict";
import { test } from "node:test";
import { imageTypeOf } from "./imageUpload.js";

test("사진 종류는 파일 앞부분으로 판단", () => {
  assert.equal(imageTypeOf(Buffer.from([0xff, 0xd8, 0xff, 0xe0])).type, "image/jpeg");
  assert.equal(imageTypeOf(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0])).type, "image/png");
  assert.equal(imageTypeOf(Buffer.from("RIFF\0\0\0\0WEBPVP8 ", "latin1")).type, "image/webp");
  assert.equal(imageTypeOf(Buffer.from("<svg onload=alert(1)>")), null);
  assert.equal(imageTypeOf(Buffer.alloc(0)), null);
});
