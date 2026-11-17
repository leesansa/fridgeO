import { useDeleteIngredient, useIngredientPages } from "../../../queries/ingredients";
import { retryList, useInfiniteScroll } from "../../../hooks/useInfiniteScroll";
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
const FridgeItems = ({ sortBy, q, category, status, viewMode, mode, today, rootRef, onSelectIngredient }) => {
  const list = useIngredientPages({ sort: sortBy, q, category, status });
  const sentinelRef = useInfiniteScroll(list, rootRef);
  const items = list.data?.items ?? [];
  const loaded = list.isSuccess && !list.hasNextPage;
  const { mutate: deleteIngredient } = useDeleteIngredient();

  // 목록에서 먼저 빼고 DB 에서 삭제, 실패하면 되돌림 (queries/ingredients)
  const handleDeleteIngredient = (id) =>
    deleteIngredient(id, { onError: (e) => alert(`삭제하지 못했어요. ${e.message}`) });

  const viewProps = {
    items: items.map(toItem),
    today,
    onDeleteIngredient: mode === "delete" ? handleDeleteIngredient : undefined,
    onSelectIngredient: mode === "edit" ? onSelectIngredient : undefined,
  };
  // loaded = 끝까지 받음. 그런데 0개면 "없음" 문구

  return (
    <>
      {items.length > 0 && (viewMode === "list" ? <List {...viewProps} /> : <Box {...viewProps} />)}
      {loaded && items.length === 0 && (
        <p className="fridge-empty">{q ? "검색한 재료가 없어요." : category ? "냉장고에 조미료가 없어요." : status ? "기한이 지난 재료가 없어요." : "냉장고에 재료가 없어요. + 버튼으로 추가해 보세요."}</p>
      )}
      {list.isError && (
        <p className="fridge-empty" role="alert">
          {list.error.message} <button type="button" onClick={() => retryList(list)}>다시 시도</button>
        </p>
      )}
      <div ref={sentinelRef} aria-hidden="true" />
    </>
  );
};

export default FridgeItems;
