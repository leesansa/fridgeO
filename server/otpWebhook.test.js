// 실행: npm test  (Neon 서명 검증과 번호 변환만 확인, Solapi 실제 발송은 하지 않음)
import { test } from "node:test";
import assert from "node:assert/strict";
import { FlattenedSign, generateKeyPair } from "jose";
import { verifyNeonWebhook, toKoreanNumber } from "./otpWebhook.js";

const { publicKey, privateKey } = await generateKeyPair("EdDSA");
const getKey = () => publicKey;

// Neon과 같은 방식으로 서명한 헤더를 만든다
async function signLikeNeon(body, ts = String(Date.now())) {
  const input = `${ts}.${Buffer.from(body).toString("base64url")}`;
  const jws = await new FlattenedSign(new TextEncoder().encode(input))
    .setProtectedHeader({ alg: "EdDSA", kid: "k1" })
    .sign(privateKey);
  return {
    "x-neon-signature": `${jws.protected}..${jws.signature}`,
    "x-neon-signature-kid": "k1",
    "x-neon-timestamp": ts,
  };
}

const body = JSON.stringify({ event_type: "send.otp", event_data: { otp_code: "123456" } });

test("올바른 서명은 통과하고 본문을 돌려준다", async () => {
  const event = await verifyNeonWebhook(Buffer.from(body), await signLikeNeon(body), getKey);
  assert.equal(event.event_data.otp_code, "123456");
});

test("본문이 바뀌면 거부", async () => {
  const headers = await signLikeNeon(body);
  await assert.rejects(verifyNeonWebhook(Buffer.from(body.replace("123456", "000000")), headers, getKey));
});

test("5분 넘은 요청과 잘못된 타임스탬프는 거부", async () => {
  const old = String(Date.now() - 6 * 60_000);
  await assert.rejects(verifyNeonWebhook(Buffer.from(body), await signLikeNeon(body, old), getKey));
  await assert.rejects(verifyNeonWebhook(Buffer.from(body), await signLikeNeon(body, "abc"), getKey));
});

test("서명 헤더가 없으면 거부", async () => {
  await assert.rejects(verifyNeonWebhook(Buffer.from(body), {}, getKey));
});

test("E.164 → 국내 번호 변환", () => {
  assert.equal(toKoreanNumber("+821012345678"), "01012345678");
  assert.equal(toKoreanNumber("+15551234567"), null);
  assert.equal(toKoreanNumber(undefined), null);
});
