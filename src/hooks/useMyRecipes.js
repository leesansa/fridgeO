import { useMyRecipeList } from "../queries/me";
import { useDeleteRecipe } from "../queries/recipes";

// 내가 쓴 레시피 (GET /api/me/recipes) + 삭제. 모바일·데스크탑 마이페이지가 같이 씀. 작성자 확인은 서버가 로그인 계정으로 함
export function useMyRecipes() {
  const list = useMyRecipeList();
  const del = useDeleteRecipe();

  // 지우면 내 레시피 목록을 다시 받음 (queries/recipes). 지우는 중에는 그 레시피 버튼을 잠금
  const remove = (recipe) => {
    if (!window.confirm(`"${recipe.title}" 레시피를 삭제할까요? 리뷰와 북마크도 함께 지워지고 되돌릴 수 없어요.`)) return;
    del.mutate(recipe.id);
  };

  return {
    recipes: list.data ?? null, // 불러오기 전 null
    error: del.error?.message ?? list.error?.message ?? "",
    deleting: del.isPending ? del.variables : null,
    remove,
  };
}
