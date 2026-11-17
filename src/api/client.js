// 우리 API 서버(server/) 호출 공통. 로그인한 사용자의 토큰을 붙여 보낸다. 엔드포인트별 함수는 같은 폴더의 파일들 (server/routes/ 와 1:1)
import { authClient, getSession } from "../utils/auth";

// API 서버 주소. 배포 때는 .env.production 의 VITE_API_URL(Worker 주소), 로컬은 비워 두면 Vite 프록시(/api)로 감
export const API_URL = import.meta.env.VITE_API_URL ?? "";

// 지금 로그인 토큰. useSession 이 이미 "로그아웃"으로 확인했으면 Neon Auth 에 묻지 않음
// (Neon SDK 는 로그인 세션만 캐시해서, 로그아웃 상태면 호출마다 get-session 요청이 나갔음)
async function currentToken() {
  const known = authClient.$store.atoms.session.get();
  if (!known.isPending && !known.data) return null;
  return (await getSession())?.session.token ?? null;
}

const bearer = (token) => (token ? { Authorization: `Bearer ${token}` } : {});

// send(헤더) 로 요청. 401 이면 세션을 새로 받아 토큰이 달라졌을 때만 한 번 더 보냄
// (로그인 직후 useSession 이 아직 로그아웃으로 알고 있거나, 토큰이 만료된 경우)
export async function sendWithAuth(send) {
  const token = await currentToken();
  const res = await send(bearer(token));
  if (res.status !== 401) return res;
  const fresh = (await getSession())?.session.token ?? null;
  return fresh && fresh !== token ? send(bearer(fresh)) : res;
}

// JSON 요청. 실패하면 서버의 오류 문구로 Error를 던진다
export async function apiFetch(path, { body, ...options } = {}) {
  const res = await sendWithAuth((auth) => fetch(API_URL + path, {
    ...options,
    headers: { "Content-Type": "application/json", ...auth },
    body: body === undefined ? undefined : JSON.stringify(body),
  }));
  const data = await res.json().catch(() => null);
  if (!res.ok) throw Object.assign(new Error(data?.error ?? "서버에 연결할 수 없습니다. (npm run server 실행 확인)"), { status: res.status });
  return data;
}

// { q: "사과", category: null } → "q=%EC%82%AC%EA%B3%BC" (비어 있는 값은 뺌)
export const toQuery = (params = {}) =>
  new URLSearchParams(Object.entries(params).filter(([, v]) => v !== undefined && v !== null && v !== "")).toString();

// 주소에 넣는 id
export const seg = (id) => encodeURIComponent(id);
