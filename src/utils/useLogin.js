import { useState } from "react";
import { useNavigate } from "react-router";
import { apiFetch, authClient, authErrorMessage } from "./auth";

// 로그인 (모바일·데스크탑 공통). Neon Auth 는 이메일 로그인만 지원. 성공하면 마이페이지로
export function useLogin() {
  const navigate = useNavigate();
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);

  const login = async (email, password) => {
    setError("");
    setPending(true);
    try {
      await authClient.signIn.email({ email, password });
      // 가입 직후 프로필 생성이 실패했던 경우를 위해 로그인 때도 프로필 행을 보장한다
      await apiFetch("/api/me", { method: "POST", body: {} });
      navigate("/mypage");
    } catch (err) {
      setError(authErrorMessage(err));
    } finally {
      setPending(false);
    }
  };

  return { error, pending, login };
}
