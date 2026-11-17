import { useCallback, useEffect, useRef, useState } from "react";

// 무한 스크롤 공통: 목록 끝(sentinelRef)이 스크롤 영역(rootRef, 없으면 화면 전체)에 보이면 다음 페이지를 불러옴
// loadPage(position) → { items, next, total? }. position 은 0 에서 시작, next 가 null 이면 끝
// 조건(검색어·분류 등)이 바뀌면 부모가 key 로 새로 만들어서 처음부터 다시
export function useInfiniteScroll(loadPage, rootRef) {
  const [items, setItems] = useState([]);
  const [total, setTotal] = useState(null); // 첫 페이지 응답에 total 이 있으면 (재료 목록)
  const [position, setPosition] = useState(0); // 다음에 불러올 위치, null 이면 끝
  const [error, setError] = useState("");
  const loadingRef = useRef(false); // 같은 페이지를 두 번 부르지 않게
  const sentinelRef = useRef(null);
  const loadPageRef = useRef(loadPage); // 부모가 매번 새 함수를 넘겨도 관찰을 다시 걸지 않게 최신 것만 기억
  useEffect(() => { loadPageRef.current = loadPage; });

  const loadMore = useCallback(async () => {
    if (loadingRef.current || position === null) return;
    loadingRef.current = true;
    try {
      const page = await loadPageRef.current(position);
      // 첫 페이지는 덮어써서 개발 모드(StrictMode)에서 두 번 불려도 중복되지 않게
      setItems((prev) => [...(position === 0 ? [] : prev), ...page.items]);
      if (position === 0) setTotal(page.total ?? null);
      setPosition(page.next);
    } catch (e) {
      setError(e.message);
    } finally {
      loadingRef.current = false;
    }
  }, [position]);

  // position 이 바뀌면 다시 관찰해서 화면이 찰 때까지 이어 불러옴
  useEffect(() => {
    if (error || position === null) return;
    const observer = new IntersectionObserver(
      ([entry]) => entry.isIntersecting && loadMore(),
      { root: rootRef?.current ?? null, rootMargin: "200px" },
    );
    observer.observe(sentinelRef.current);
    return () => observer.disconnect();
  }, [loadMore, error, position, rootRef]);

  return { items, setItems, total, error, setError, done: position === null, sentinelRef };
}
