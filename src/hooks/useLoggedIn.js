import { authClient } from "../utils/auth";

// 로그인했는지 (Neon Auth 세션). 확인 전에는 false
export const useLoggedIn = () => Boolean(authClient.useSession().data?.session);
