import { useCallback, useEffect, useRef, useState } from "react";
import { apiFetch } from "./auth";

// 레시피 무한 스크롤 (GET /api/recipes). 모바일 카드 목록과 데스크탑 카드 격자가 같이 씀
// 분류·검색어가 바뀌면 부모가 key 로 새로 만들어서 목록·cursor 가 처음부터 시작
// rootRef = 스크롤 영역 (없으면 화면 전체), sentinelRef 를 목록 끝에 붙이면 보일 때 다음 페이지
export function useRecipePages({ categoryId, q }, rootRef) {
  const [recipes, setRecipes] = useState([]);
  const [cursor, setCursor] = useState(0); // 다음에 불러올 위치, null 이면 끝
  const [error, setError] = useState("");
  const loadingRef = useRef(false); // 같은 페이지를 두 번 부르지 않게
  const sentinelRef = useRef(null);

  const loadMore = useCallback(async () => {
    if (loadingRef.current || cursor === null) return;
    loadingRef.current = true;
    try {
      const query = new URLSearchParams({ cursor });
      if (categoryId !== null) query.set("category", categoryId);
      if (q) query.set("q", q);
      const data = await apiFetch(`/api/recipes?${query}`);
      setRecipes((prev) => [...prev, ...data.items]);
      setCursor(data.nextCursor);
    } catch (e) {
      setError(e.message);
    } finally {
      loadingRef.current = false;
    }
  }, [cursor, categoryId, q]);

  // 목록 끝(sentinel)이 보이면 다음 페이지. cursor 가 바뀌면 다시 관찰해서 화면이 찰 때까지 이어 불러옴
  useEffect(() => {
    if (error || cursor === null) return;
    const observer = new IntersectionObserver(
      ([entry]) => entry.isIntersecting && loadMore(),
      { root: rootRef?.current ?? null, rootMargin: "200px" },
    );
    observer.observe(sentinelRef.current);
    return () => observer.disconnect();
  }, [loadMore, error, cursor, rootRef]);

  return { recipes, error, setError, done: cursor === null, sentinelRef };
}
