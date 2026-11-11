// Neon Auth send.otp 웹훅 검증 + Solapi 문자 발송. Neon은 인증번호만 만들고, 문자는 이 서버가 Solapi로 보낸다
import { createHmac, randomBytes } from "node:crypto";
import { flattenedVerify } from "jose";

const MAX_AGE_MS = 5 * 60_000;

// Neon 웹훅 서명(분리형 JWS "헤더..서명") 검증. 서명 대상 = base64url("<타임스탬프>." + base64url(원본 본문))
// getKey는 Neon JWKS(createRemoteJWKSet). 통과하면 파싱한 본문을 돌려주고, 아니면 예외
export async function verifyNeonWebhook(rawBody, headers, getKey) {
  const ts = headers["x-neon-timestamp"];
  const kid = headers["x-neon-signature-kid"];
  const [protectedHeader, empty, signature] = (headers["x-neon-signature"] ?? "").split(".");
  if (!ts || !kid || !protectedHeader || empty !== "" || !signature) throw new Error("서명 헤더 없음");
  // NaN(잘못된 값)도 걸러지도록 부정형으로 비교
  if (!(Math.abs(Date.now() - Number(ts)) <= MAX_AGE_MS)) throw new Error("오래된 요청");
  const payload = Buffer.from(`${ts}.${rawBody.toString("base64url")}`).toString("base64url");
  await flattenedVerify(
    { protected: protectedHeader, payload, signature },
    (header) => getKey({ ...header, kid }),
    { algorithms: ["EdDSA", "Ed25519"] },
  );
  return JSON.parse(rawBody.toString("utf8"));
}

// Neon은 E.164(+821012345678), Solapi는 국내 형식(01012345678). 국내 휴대폰 번호가 아니면 null
// shortcut: 국내 번호만 지원, 해외 번호가 필요하면 Solapi country 필드 사용
export function toKoreanNumber(e164) {
  const m = /^\+82(1\d{8,9})$/.exec(e164 ?? "");
  return m ? `0${m[1]}` : null;
}

// Solapi 단건 문자 발송. 인증: HMAC-SHA256(API Secret, 날짜 + salt) hex
export async function sendSms(to, text) {
  const { SOLAPI_API_KEY, SOLAPI_API_SECRET, SOLAPI_SENDER } = process.env;
  if (!SOLAPI_API_KEY || !SOLAPI_API_SECRET || !SOLAPI_SENDER) {
    throw new Error(".env 에 SOLAPI_API_KEY, SOLAPI_API_SECRET, SOLAPI_SENDER 를 설정하세요");
  }
  const date = new Date().toISOString();
  const salt = randomBytes(16).toString("hex");
  const signature = createHmac("sha256", SOLAPI_API_SECRET).update(date + salt).digest("hex");
  const res = await fetch("https://api.solapi.com/messages/v4/send-many/detail", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `HMAC-SHA256 apiKey=${SOLAPI_API_KEY}, date=${date}, salt=${salt}, signature=${signature}`,
    },
    body: JSON.stringify({ messages: [{ to, from: SOLAPI_SENDER, text }] }),
    // Neon은 시도당 최대 10초까지 기다린다 (콘솔 timeout 설정)
    signal: AbortSignal.timeout(8_000),
  });
  const data = await res.json().catch(() => null);
  // 등록 실패(미등록 발신번호, 잔액 부족 등)는 200 이어도 failedMessageList 에 담겨 온다
  if (!res.ok || data?.failedMessageList?.length) {
    throw new Error(`Solapi 발송 실패 (${res.status}): ${JSON.stringify(data?.failedMessageList ?? data)}`);
  }
}
