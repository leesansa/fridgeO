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
};

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
