import { setBookmark } from "../api/reviews";
import { useToggleRequest } from "./useToggleRequest";

// 레시피 북마크 (DB recipe_bookmarks). 모바일·데스크탑 상세가 같이 씀. 레시피가 바뀌면 부모가 key 로 새로 만듦
// 처음 값은 상세 응답 (로그인 안 했으면 false). 실패하면 error 문구로 표시
export function useRecipeBookmark(recipe) {
  const { on, ...rest } = useToggleRequest(recipe.bookmarked, (next) => setBookmark(recipe.id, next));
  return { saved: on, ...rest };
}
