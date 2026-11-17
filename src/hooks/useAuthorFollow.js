import { useNavigate } from "react-router";
import { useSetFollow } from "../queries/reviews";
import { useLoggedIn } from "./useLoggedIn";

// 레시피 작성자 팔로우 (DB follows). 모바일 DetailInfo·데스크탑 DetailSummary 가 같이 씀. recipe = useRecipe 캐시의 레시피
// 북마크와 같은 방식: 캐시를 먼저 바꾸고 저장, 실패하면 되돌리고 alert. 로그인 안 했으면 로그인 화면으로
export function useAuthorFollow(recipe) {
  const navigate = useNavigate();
  const loggedIn = useLoggedIn();
  const { mutate, isPending } = useSetFollow();

  const toggle = () => {
    if (!loggedIn) return navigate("/login");
    mutate(
      { recipeId: recipe.id, on: !recipe.following },
      { onError: (e) => alert(`팔로우를 바꾸지 못했어요. ${e.message}`) },
    );
  };

  // 작성자가 있고(초기 데이터·탈퇴 아님) 내 레시피가 아닐 때만 팔로우 버튼
  return { canFollow: Boolean(recipe.author) && !recipe.mine, following: Boolean(recipe.following), saving: isPending, toggle };
}
