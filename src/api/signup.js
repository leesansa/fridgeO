// 회원가입 (server/routes/signup.js). 로그인 불필요
import { apiFetch } from "./client";

// → { available }
export const checkEmail = (email) => apiFetch("/api/signup/check-email", { method: "POST", body: { email } });
