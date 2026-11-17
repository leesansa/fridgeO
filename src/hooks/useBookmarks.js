import { useMyBookmarks } from "../queries/me";
import { useSetBookmark } from "../queries/reviews";

// 내 북마크 화면 (GET /api/me/bookmarks, 최근 저장한 순 최대 50개) + 해제. 모바일·데스크탑 북마크 화면이 같이 씀
// 해제하면 목록에서 먼저 빼고 저장, 실패하면 되돌리고 alert
export function useBookmarks() {
  const { data, error, refetch } = useMyBookmarks();
  const { mutate, isPending, variables } = useSetBookmark();

  const remove = (id) =>
    mutate({ recipeId: id, on: false }, { onError: (e) => alert(`북마크를 해제하지 못했어요. ${e.message}`) });

  return {
    recipes: data ?? null, // 불러오기 전 null
    error: error?.message ?? "",
    removingId: isPending ? variables.recipeId : null,
    retry: () => refetch(),
    remove,
  };
}
