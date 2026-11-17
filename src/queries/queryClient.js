// React Query 클라이언트 (main.jsx 의 QueryClientProvider 에 넘김). 조회·저장 훅은 같은 폴더의 recipes·ingredients·me·reviews·notifications.js
import { QueryClient } from "@tanstack/react-query";

// 30초 안에 같은 데이터를 다시 쓰면 요청 없이 캐시 사용
// 실패하면 한 번만 다시 시도. 4xx(로그인 필요·없음 등)는 다시 해도 같으니 바로 실패
const retry = (count, error) => count < 1 && !(error.status >= 400 && error.status < 500);

export const queryClient = new QueryClient({
  defaultOptions: { queries: { staleTime: 30_000, retry, refetchOnWindowFocus: false } },
});

// 계정과 상관없는 데이터 (로그인·로그아웃·저장해도 그대로 둠)
const SHARED = new Set(["categories", "ingredient-catalog"]);
const isAccountData = (query) => !SHARED.has(query.queryKey[0]);

// 다른 계정으로 바뀌거나 로그아웃하면 이전 계정 데이터를 지움
export const clearAccountData = () => queryClient.removeQueries({ predicate: isAccountData });

// 무한 스크롤 목록(useInfiniteQuery)의 select: 페이지들을 한 줄로 → { items, total } (total 은 첫 페이지에 있을 때만)
export const flatPages = (data) => ({ items: data.pages.flatMap((page) => page.items), total: data.pages[0]?.total ?? null });
