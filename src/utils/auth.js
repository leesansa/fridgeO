// Neon Auth 로그인 상태와 API 서버 호출. 세션은 Neon Auth가 관리하고, API 서버에는 JWT를 Bearer로 보낸다
import { createAuthClient } from "@neon/neon-js/auth";

export const authClient = createAuthClient(import.meta.env.VITE_NEON_AUTH_URL);

// 로그인 중이면 { session, user }, 아니면 null. Neon Auth에 연결하지 못해도(설정 누락·네트워크) 로그아웃으로 본다
export async function getSession() {
  try {
    const { data } = await authClient.getSession();
    return data?.session ? data : null;
  } catch (err) {
    console.error("Neon Auth 세션 확인 실패 (.env의 VITE_NEON_AUTH_URL 확인):", err);
    return null;
  }
}

export const isLoggedIn = async () => Boolean(await getSession());

// Neon Auth(Better Auth) 오류 코드 → 화면 문구. 모르는 코드는 서버 메시지를 그대로 보여준다
// Neon SDK는 실패하면 { error }를 돌려주지 않고 예외를 던진다. 원래 코드는 err.error.code에 있다
const AUTH_ERRORS = {
  INVALID_EMAIL_OR_PASSWORD: "이메일 또는 비밀번호가 올바르지 않습니다.",
  USER_ALREADY_EXISTS: "이미 가입된 이메일입니다.",
  USER_ALREADY_EXISTS_USE_ANOTHER_EMAIL: "이미 가입된 이메일입니다.",
  INVALID_EMAIL: "이메일 형식이 올바르지 않습니다.",
  PASSWORD_TOO_SHORT: "비밀번호가 너무 짧습니다. (8자 이상)",
  PASSWORD_TOO_LONG: "비밀번호가 너무 깁니다.",
  // 휴대폰 인증 (Better Auth phone-number 플러그인)
  INVALID_PHONE_NUMBER: "휴대폰 번호 형식이 올바르지 않습니다.",
  PHONE_NUMBER_EXIST: "이미 다른 계정에 등록된 휴대폰 번호입니다.",
  OTP_NOT_FOUND: "인증번호를 먼저 요청해 주세요.",
  INVALID_OTP: "인증번호가 올바르지 않습니다.",
  OTP_EXPIRED: "인증번호가 만료되었습니다. 다시 요청해 주세요.",
  TOO_MANY_ATTEMPTS: "시도 횟수를 초과했습니다. 인증번호를 다시 요청해 주세요.",
  PHONE_NUMBER_NOT_EXIST: "가입된 휴대폰 번호가 아닙니다.",
};

// 010-1234-5678 → +821012345678 (Neon은 E.164 형식만 받는다). 국내 휴대폰 번호가 아니면 null
export const toE164 = (value) => {
  const digits = value.replace(/\D/g, "");
  return /^01\d{8,9}$/.test(digits) ? `+82${digits.slice(1)}` : null;
};

export const PHONE_FORMAT_MESSAGE = "휴대폰 번호를 확인해 주세요. (예: 010-1234-5678)";

export const authErrorMessage = (err) =>
  AUTH_ERRORS[err?.error?.code ?? err?.code] ?? err?.message ?? "요청을 처리하지 못했습니다. 잠시 후 다시 시도해 주세요.";

// 로그인한 사용자의 토큰을 붙여 API 서버(/api/...)를 호출한다. 실패하면 서버의 오류 문구로 Error를 던진다
export async function apiFetch(path, { body, ...options } = {}) {
  const token = (await getSession())?.session.token;
  const res = await fetch(path, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token && { Authorization: `Bearer ${token}` }),
    },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  const data = await res.json().catch(() => null);
  if (!res.ok) throw new Error(data?.error ?? "서버에 연결할 수 없습니다. (npm run server 실행 확인)");
  return data;
}
