// Neon Auth send.otp 웹훅 → Solapi 문자 발송. Neon 콘솔 Auth > Webhooks 에 이 주소(HTTPS)를 등록 (로그인 대신 서명을 검증)
import { Hono } from "hono";
import { HttpError, readBody } from "../lib/http.js";
import { sendSms, toKoreanNumber, verifyNeonWebhook } from "../lib/otpWebhook.js";
import { jwksFor } from "../middleware/auth.js";

const webhooks = new Hono();

webhooks.post("/api/webhooks/neon", async (c) => {
  const sql = c.get("sql");
  const raw = await readBody(c);
  let event;
  try {
    event = await verifyNeonWebhook(raw, Object.fromEntries(c.req.raw.headers), jwksFor(c.env));
  } catch {
    throw new HttpError(401, "웹훅 서명이 올바르지 않습니다");
  }
  // 이메일 인증번호는 Neon이 직접 보낸다. 문자(전화번호 플러그인)만 처리
  if (event.event_type !== "send.otp" || event.event_data?.delivery_preference === "email") return c.json({ ok: true });

  // 문서상 번호 위치가 명시돼 있지 않아 두 곳을 확인한다
  const to = toKoreanNumber(event.event_data?.phone_number ?? event.user?.phone_number);
  if (!to) {
    // 인증번호는 남기지 않고 필드 이름만 기록 (번호 위치 확인용)
    console.warn("send.otp 에 국내 휴대폰 번호 없음", Object.keys(event.event_data ?? {}), Object.keys(event.user ?? {}));
    throw new HttpError(422, "문자를 보낼 전화번호가 없습니다");
  }

  // Neon 재시도(같은 event_id)로 문자가 두 번 가지 않게 이벤트를 먼저 기록. 이미 있으면 이미 처리한 것
  // (Workers 는 요청마다 다른 곳에서 실행될 수 있어 메모리가 아니라 DB 에 기록)
  const [claimed] = await sql`INSERT INTO otp_events (event_id) VALUES (${event.event_id}) ON CONFLICT DO NOTHING RETURNING event_id`;
  if (!claimed) return c.json({ ok: true });
  try {
    await sendSms(c.env, to, `[fridgeO] 인증번호는 ${event.event_data.otp_code} 입니다.`);
  } catch (e) {
    await sql`DELETE FROM otp_events WHERE event_id = ${event.event_id}`; // 실패하면 Neon 재시도 때 다시 보낼 수 있게
    throw e;
  }
  await sql`DELETE FROM otp_events WHERE created_at < now() - interval '1 day'`;
  return c.json({ ok: true });
});

export default webhooks;
