import { useIngredientSearch } from "../queries/ingredients";
import { useRecipes } from "../queries/recipes";
import { authClient } from "../utils/auth";

// 통합 검색 (모바일·데스크탑 공통): 레시피(제목·재료 이름) + 내 냉장고 재료(로그인 시)를 한 번에. 각 목록은 첫 페이지만
// result = { recipes, ingredients(로그인 안 했거나 30자 넘으면 null) } | { error }
export function useUnifiedSearch(q) {
  const { data: session, isPending: sessionPending } = authClient.useSession();
  // 재료 검색은 30자까지, 로그인한 사람 것만
  const searchIngredients = Boolean(q) && Boolean(session?.session) && q.length <= 30;
  const recipes = useRecipes({ q }, { enabled: Boolean(q) });
  const ingredients = useIngredientSearch(q, { enabled: searchIngredients });

  const error = recipes.error ?? (searchIngredients ? ingredients.error : null);
  const loading = Boolean(q) && !error && (sessionPending || recipes.isPending || (searchIngredients && ingredients.isPending));

  return {
    loading,
    result: error
      ? { error: error.message }
      : { recipes: recipes.data, ingredients: searchIngredients ? ingredients.data : null },
  };
}
