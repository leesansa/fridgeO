import { useState } from "react";
import { useDeleteIngredient, useIngredientCatalog, useUpdateIngredient } from "../queries/ingredients";
import { getTodayKey } from "../utils/date";

// /ingredient/edit/:id 재료 편집 (모바일·데스크탑 공통). 고칠 재료는 queries 의 useIngredient 로 받음
// 편집 입력값 + 저장(PATCH)·삭제(DELETE). 성공하면 true, 이동은 화면이 정함. 재료가 바뀌면 부모가 key 로 새로 만듦
export function useIngredientEditForm(item) {
  const [today] = useState(getTodayKey);
  const catalog = useIngredientCatalog(); // 이름 자동완성용
  const [ingredient, setIngredient] = useState(item.name ?? "");
  const [quantity, setQuantity] = useState(item.quantity); // 입력칸 글자 그대로 (저장할 때 숫자로 검사)
  const [unit, setUnit] = useState(item.unit); // 모바일은 그대로, 데스크탑은 바꿀 수 있음
  const [storage, setStorage] = useState(item.storage);
  const [expiryDate, setExpiryDate] = useState(item.expiry_date ?? "");
  const update = useUpdateIngredient();
  const del = useDeleteIngredient();

  const save = async () => {
    const name = ingredient.trim();
    if (!name || !expiryDate) {
      alert("재료 이름과 소비기한을 입력해 주세요.");
      return false;
    }
    const amount = Number(quantity);
    // 0 = 다 떨어짐 (지우지 않고 남겨 두면 메인 "다 떨어진 상품"에 표시)
    if (quantity === "" || !Number.isFinite(amount) || amount < 0) {
      alert("수량은 0 이상의 숫자로 입력해 주세요.");
      return false;
    }
    try {
      await update.mutateAsync({ id: item.id, body: { name, quantity: amount, unit, storage, expiryDate } });
      return true;
    } catch (e) {
      alert(`편집 내용을 저장하지 못했어요. ${e.message}`);
      return false;
    }
  };

  const remove = async () => {
    if (!window.confirm(`'${item.name}'을(를) 냉장고에서 삭제할까요? 되돌릴 수 없어요.`)) return false;
    try {
      await del.mutateAsync(item.id);
      return true;
    } catch (e) {
      alert(`삭제하지 못했어요. ${e.message}`);
      return false;
    }
  };

  return {
    today, catalog,
    ingredient, setIngredient, quantity, setQuantity, unit, setUnit, storage, setStorage, expiryDate, setExpiryDate,
    saving: update.isPending || del.isPending, // 저장·삭제 중 연타 방지
    save, remove,
  };
}
