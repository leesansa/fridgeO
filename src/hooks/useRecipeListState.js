import { useCallback, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router";
import { useCategories } from "../queries/recipes";

const ALL = { id: null, name: "전체" };

// 레시피 목록 화면 상태 (모바일·데스크탑 공통): 분류 목록(DB) + 고른 분류 + 검색어
// 검색어는 주소 ?q=, 고른 분류 id 는 ?category= 에 둔다 → 상세에서 뒤로 오거나 새로고침해도 유지,
// 상세 페이지 Enter 검색·데스크탑 헤더 "전체 카테고리"도 주소로 들어옴
export function useRecipeListState() {
  // DB 분류 목록. 실패하면 "전체"만 남고 레시피 목록은 그대로 동작
  const { data: rows } = useCategories();
  const categories = useMemo(() => [ALL, ...(rows ?? [])], [rows]);
  const [searchParams, setSearchParams] = useSearchParams();
  const q = searchParams.get("q")?.trim() ?? "";
  const [text, setText] = useState(q); // 입력창 글자 (타자 칠 때마다 바뀜)
  const selected = searchParams.get("category") || null; // null = 전체

  // 주소의 다른 값은 두고 key 하나만 바꿈 (분류를 골라도 검색어 유지, 반대도 마찬가지)
  const setParam = useCallback((key, value) => {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      if (value) next.set(key, value);
      else next.delete(key);
      return next;
    }, { replace: true });
  }, [setSearchParams]);

  // 입력이 0.3초 멈추면 검색 (글자마다 요청하지 않게)
  useEffect(() => {
    const timer = setTimeout(() => {
      const next = text.trim();
      if (next !== q) setParam("q", next);
    }, 300);
    return () => clearTimeout(timer);
  }, [text, q, setParam]);

  const selectCategory = useCallback((id) => setParam("category", id), [setParam]);

  return { categories, selected, selectCategory, q, text, setText };
}
