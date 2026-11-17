import { getRecipes } from "../api/recipes";
import { useInfiniteScroll } from "./useInfiniteScroll";

// 레시피 무한 스크롤 (GET /api/recipes). 모바일 카드 목록과 데스크탑 카드 격자가 같이 씀
// 분류·검색어가 바뀌면 부모가 key 로 새로 만들어서 처음부터 다시
export function useRecipePages({ categoryId, q }, rootRef) {
  const { items, ...rest } = useInfiniteScroll(async (cursor) => {
    const data = await getRecipes({ cursor, category: categoryId, q });
    return { items: data.items, next: data.nextCursor };
  }, rootRef);
  return { recipes: items, ...rest };
}
