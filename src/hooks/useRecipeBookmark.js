import { useNavigate } from "react-router";
import { useSetBookmark } from "../queries/reviews";
import { useLoggedIn } from "./useLoggedIn";

// 레시피 북마크 (DB recipe_bookmarks). 모바일·데스크탑 상세가 같이 씀. recipe = useRecipe 캐시의 레시피
// 누르면 캐시의 bookmarked 를 먼저 바꾸고 저장, 실패하면 되돌리고 error 문구. 로그인 안 했으면 로그인 화면으로
export function useRecipeBookmark(recipe) {
  const navigate = useNavigate();
  const loggedIn = useLoggedIn();
  const { mutate, isPending, error } = useSetBookmark();

  const toggle = () => {
    if (!loggedIn) return navigate("/login");
    mutate({ recipeId: recipe.id, on: !recipe.bookmarked });
  };

  return { saved: Boolean(recipe.bookmarked), saving: isPending, error: error?.message ?? "", toggle };
}
