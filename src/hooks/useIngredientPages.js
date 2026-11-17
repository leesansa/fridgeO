import { useCallback, useEffect, useRef, useState } from "react";
import { apiFetch } from "../utils/auth";

// 내 냉장고 재료 (GET /api/ingredients) 무한 스크롤. 모바일 목록과 데스크탑 보관 칸이 같이 씀
// params = { sort, q, category, storage, status } (빈 값은 빼고 보냄). params 가 바뀌면 부모가 key 로 새로 만들어서 처음부터 다시
// rootRef = 스크롤 영역, sentinelRef 를 목록 끝에 붙이면 보일 때 다음 페이지
export function useIngredientPages(params, rootRef) {
  const [items, setItems] = useState([]); // DB 행 그대로
  const [total, setTotal] = useState(null); // 같은 조건 전체 개수 (첫 페이지에서 받음)
  const [nextOffset, setNextOffset] = useState(0); // null = 끝
  const [error, setError] = useState("");
  const loadingRef = useRef(false); // 같은 페이지를 두 번 부르지 않게
  const sentinelRef = useRef(null);
  const query = new URLSearchParams(Object.entries(params).filter(([, v]) => v)).toString();

  const loadMore = useCallback(async () => {
    if (loadingRef.current || nextOffset === null) return;
    loadingRef.current = true;
    try {
      const data = await apiFetch(`/api/ingredients?${query}&offset=${nextOffset}`);
      // 첫 페이지는 덮어써서 개발 모드(StrictMode)에서 두 번 불려도 중복되지 않게
      setItems((prev) => [...(nextOffset === 0 ? [] : prev), ...data.items]);
      if (nextOffset === 0) setTotal(data.total);
      setNextOffset(data.nextOffset);
    } catch (e) {
      setError(e.message);
    } finally {
      loadingRef.current = false;
    }
  }, [nextOffset, query]);

  // 목록 끝(sentinel)이 스크롤 영역에 보이면 다음 페이지. 화면이 찰 때까지 이어 불러옴
  useEffect(() => {
    if (error || nextOffset === null) return;
    const observer = new IntersectionObserver(
      ([entry]) => entry.isIntersecting && loadMore(),
      { root: rootRef.current, rootMargin: "200px" },
    );
    observer.observe(sentinelRef.current);
    return () => observer.disconnect();
  }, [loadMore, error, nextOffset, rootRef]);

  return { items, setItems, total, error, setError, loaded: nextOffset === null, sentinelRef };
}
