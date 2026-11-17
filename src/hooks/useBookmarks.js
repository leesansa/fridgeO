import { useCallback, useEffect, useState } from "react";
import { getMyBookmarks } from "../api/me";
import { setBookmark } from "../api/reviews";

// 내 북마크 (GET /api/me/bookmarks, 최근 저장한 순 최대 50개) + 해제. 모바일·데스크탑 북마크 화면이 같이 씀
export function useBookmarks() {
  const [recipes, setRecipes] = useState(null); // 불러오기 전 null
  const [error, setError] = useState("");
  const [removingId, setRemovingId] = useState(null);

  const load = useCallback(
    () => getMyBookmarks().then(setRecipes).catch((e) => setError(e.message)),
    [],
  );

  useEffect(() => { load(); }, [load]);

  // 다시 시도: "불러오는 중"으로 돌린 뒤 다시 받기
  const retry = () => {
    setError("");
    setRecipes(null);
    load();
  };

  // 화면에서 먼저 빼고 DB 에서 해제, 실패하면 되돌림
  const remove = async (id) => {
    const before = recipes;
    setRemovingId(id);
    setRecipes((prev) => prev.filter((r) => r.id !== id));
    try {
      await setBookmark(id, false);
    } catch (e) {
      setRecipes(before);
      alert(`북마크를 해제하지 못했어요. ${e.message}`);
    } finally {
      setRemovingId(null);
    }
  };

  return { recipes, error, removingId, retry, remove };
}
