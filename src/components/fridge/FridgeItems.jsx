import { useCallback, useEffect, useRef, useState } from "react";
import { apiFetch } from "../../utils/auth";
import Box from "./Box";
import List from "./List";

// DB 행 → List/Box 가 쓰는 모양 ({ id, name, quantity: "300g", storage, expiryDate: "YYYY-MM-DD" | null, image })
const toItem = (row) => ({
  id: row.id,
  name: row.name ?? "이름 없음",
  quantity: `${row.quantity}${row.unit}`,
  storage: row.storage,
  expiryDate: row.expiry_date,
  image: row.image_url,
});

// 내 냉장고 재료 (DB ingredients) 무한 스크롤. 정렬·검색어·분류(category: "조미료" | null)가 바뀌면 부모가 key 로 새로 만들어서 처음부터 다시
// mode: "delete" 면 삭제 버튼, "edit" 면 눌러서 편집 화면으로
const FridgeItems = ({ sortBy, q, category, viewMode, mode, today, rootRef, onSelectIngredient }) => {
  const [items, setItems] = useState([]);
  const [nextOffset, setNextOffset] = useState(0); // null = 끝
  const [error, setError] = useState("");
  const loadingRef = useRef(false); // 같은 페이지를 두 번 부르지 않게
  const sentinelRef = useRef(null);

  const loadMore = useCallback(async () => {
    if (loadingRef.current || nextOffset === null) return;
    loadingRef.current = true;
    try {
      const query = new URLSearchParams({ sort: sortBy, offset: nextOffset });
      if (q) query.set("q", q);
      if (category) query.set("category", category);
      const data = await apiFetch(`/api/ingredients?${query}`);
      // 첫 페이지는 덮어써서 개발 모드(StrictMode)에서 두 번 불려도 중복되지 않게
      setItems((prev) => [...(nextOffset === 0 ? [] : prev), ...data.items.map(toItem)]);
      setNextOffset(data.nextOffset);
    } catch (e) {
      setError(e.message);
    } finally {
      loadingRef.current = false;
    }
  }, [nextOffset, sortBy, q, category]);

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

  // 화면에서 먼저 빼고 DB 에서 삭제, 실패하면 되돌림
  async function handleDeleteIngredient(id) {
    const before = items;
    setItems((prev) => prev.filter((item) => item.id !== id));
    try {
      await apiFetch(`/api/ingredients/${encodeURIComponent(id)}`, { method: "DELETE" });
    } catch (e) {
      setItems(before);
      alert(`삭제하지 못했어요. ${e.message}`);
    }
  }

  const viewProps = {
    items,
    today,
    onDeleteIngredient: mode === "delete" ? handleDeleteIngredient : undefined,
    onSelectIngredient: mode === "edit" ? onSelectIngredient : undefined,
  };
  const loaded = nextOffset === null; // 끝까지 받았는데 0개면 "없음" 문구

  return (
    <>
      {items.length > 0 && (viewMode === "list" ? <List {...viewProps} /> : <Box {...viewProps} />)}
      {loaded && items.length === 0 && (
        <p className="fridge-empty">{q ? "검색한 재료가 없어요." : category ? "냉장고에 조미료가 없어요." : "냉장고에 재료가 없어요. + 버튼으로 추가해 보세요."}</p>
      )}
      {error && (
        <p className="fridge-empty" role="alert">
          {error} <button type="button" onClick={() => setError("")}>다시 시도</button>
        </p>
      )}
      <div ref={sentinelRef} aria-hidden="true" />
    </>
  );
};

export default FridgeItems;
