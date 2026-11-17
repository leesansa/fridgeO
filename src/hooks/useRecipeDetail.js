import { useEffect } from "react";
import { useRecipe } from "../queries/recipes";
import { addRecentRecipe } from "../utils/recentRecipes";

// 레시피 상세 (GET /api/recipes/:id: 기본 정보·재료·recipe_steps). 모바일·데스크탑 상세가 같이 씀
// 불러오는 중이면 recipe = null. 주소의 id 가 바뀌면 그 id 것으로 바뀜 (늦게 온 이전 응답은 캐시 키가 달라 섞이지 않음)
export function useRecipeDetail(id) {
  const { data, error } = useRecipe(id);

  useEffect(() => {
    if (data) addRecentRecipe(data); // "최근 본 레시피"에 기록
  }, [data]);

  return { recipe: data ?? null, error: error?.message ?? "" };
}
