import { useEffect, useRef } from "react";

// 무한 스크롤: 목록 끝(sentinelRef 를 붙인 요소)이 스크롤 영역(rootRef, 없으면 화면 전체)에 보이면 다음 페이지
// list = queries 의 ...Pages 훅 결과 (useInfiniteQuery). 다음 페이지가 있고, 불러오는 중이 아니고, 오류가 없을 때만
// 다 불러올 때마다 다시 관찰해서 화면이 찰 때까지 이어 불러옴
export function useInfiniteScroll(list, rootRef) {
  const sentinelRef = useRef(null);
  const { hasNextPage, isFetching, isError, fetchNextPage } = list;

  useEffect(() => {
    if (!hasNextPage || isFetching || isError) return;
    const observer = new IntersectionObserver(
      ([entry]) => entry.isIntersecting && fetchNextPage(),
      { root: rootRef?.current ?? null, rootMargin: "200px" },
    );
    observer.observe(sentinelRef.current);
    return () => observer.disconnect();
  }, [hasNextPage, isFetching, isError, fetchNextPage, rootRef]);

  return sentinelRef;
}

// "다시 시도": 첫 페이지부터 실패했으면 다시 받고, 중간에 실패했으면 다음 페이지만 다시
export const retryList = (list) => (list.data ? list.fetchNextPage() : list.refetch());
