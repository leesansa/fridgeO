import { setFollow } from "../api/reviews";
import { useToggleRequest } from "./useToggleRequest";

// 레시피 작성자 팔로우 (DB follows). 모바일 DetailInfo·데스크탑 DetailSummary 가 같이 씀. 레시피가 바뀌면 부모가 key 로 새로 만듦
// 처음 값은 상세 응답 (로그인 안 했으면 false). 실패하면 alert
export function useAuthorFollow(recipe) {
  const { on, saving, toggle } = useToggleRequest(
    recipe.following,
    (next) => setFollow(recipe.id, next),
    (e) => alert(`팔로우를 바꾸지 못했어요. ${e.message}`),
  );
  // 작성자가 있고(초기 데이터·탈퇴 아님) 내 레시피가 아닐 때만 팔로우 버튼
  return { canFollow: Boolean(recipe.author) && !recipe.mine, following: on, saving, toggle };
}
