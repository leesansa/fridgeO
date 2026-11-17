// 우리 API 서버(server/) 호출 공통. 로그인한 사용자의 토큰을 붙여 보낸다. 엔드포인트별 함수는 같은 폴더의 파일들 (server/routes/ 와 1:1)
import { getSession } from "../utils/auth";

// API 서버 주소. 배포 때는 .env.production 의 VITE_API_URL(Worker 주소), 로컬은 비워 두면 Vite 프록시(/api)로 감
export const API_URL = import.meta.env.VITE_API_URL ?? "";

// 로그인했으면 Authorization 헤더, 아니면 빈 객체
export async function authHeader() {
  const token = (await getSession())?.session.token;
  return token ? { Authorization: `Bearer ${token}` } : {};
}

// JSON 요청. 실패하면 서버의 오류 문구로 Error를 던진다
export async function apiFetch(path, { body, ...options } = {}) {
  const res = await fetch(API_URL + path, {
    ...options,
    headers: { "Content-Type": "application/json", ...(await authHeader()) },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  const data = await res.json().catch(() => null);
  if (!res.ok) throw new Error(data?.error ?? "서버에 연결할 수 없습니다. (npm run server 실행 확인)");
  return data;
}

// { q: "사과", category: null } → "q=%EC%82%AC%EA%B3%BC" (비어 있는 값은 뺌)
export const toQuery = (params = {}) =>
  new URLSearchParams(Object.entries(params).filter(([, v]) => v !== undefined && v !== null && v !== "")).toString();

// 주소에 넣는 id
export const seg = (id) => encodeURIComponent(id);
