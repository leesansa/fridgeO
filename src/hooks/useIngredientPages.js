import { apiFetch } from "../utils/auth";
import { useInfiniteScroll } from "./useInfiniteScroll";

// 내 냉장고 재료 (GET /api/ingredients) 무한 스크롤. 모바일 목록과 데스크탑 보관 칸이 같이 씀
// params = { sort, q, category, storage, status } (빈 값은 빼고 보냄). params 가 바뀌면 부모가 key 로 새로 만들어서 처음부터 다시
export function useIngredientPages(params, rootRef) {
  const query = new URLSearchParams(Object.entries(params).filter(([, v]) => v)).toString();
  const { done, ...rest } = useInfiniteScroll(async (offset) => {
    const data = await apiFetch(`/api/ingredients?${query}&offset=${offset}`);
    return { items: data.items, next: data.nextOffset, total: data.total };
  }, rootRef);
  return { ...rest, loaded: done };
}
