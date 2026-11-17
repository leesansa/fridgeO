import { useState } from "react";
import { createIngredient } from "../api/ingredients";
import { addDays, getTodayKey } from "../utils/date";
import { useIngredientCatalog } from "./useIngredientCatalog";

const DEFAULT_SHELF_LIFE = 7; // 재료 사전에 없는 재료의 기본 보관 일수

// 냉장재료 등록 화면 상태 (모바일·데스크탑 공통). 저장(submit)은 성공하면 true, 이동은 화면이 정함
export function useIngredientForm() {
  const [today] = useState(getTodayKey);
  const [ingredient, setIngredient] = useState("사과");
  const [quantity, setQuantity] = useState(3);
  const [unit, setUnit] = useState("개"); // 모바일은 "개" 고정, 데스크탑은 고를 수 있음
  const [storage, setStorage] = useState("냉장");
  const catalog = useIngredientCatalog();
  // 직접 고른 날짜. 고르기 전(null)에는 오늘 + 재료의 기본 보관 일수
  const [pickedExpiry, setPickedExpiry] = useState(null);
  const known = catalog.find((item) => item.name === ingredient.trim());
  const shelfLife = known?.shelf_life_days ?? DEFAULT_SHELF_LIFE;
  const expiryDate = pickedExpiry ?? addDays(today, shelfLife);
  const [saving, setSaving] = useState(false); // 저장 중 두 번 눌러 두 개 생기지 않게

  // DB(ingredients)에 저장
  const submit = async () => {
    const name = ingredient.trim();
    if (!name) {
      alert("재료 이름을 입력해 주세요.");
      return false;
    }
    setSaving(true);
    try {
      await createIngredient({ name, quantity, unit, storage, expiryDate: expiryDate || null });
      return true;
    } catch (e) {
      alert(`재료를 추가하지 못했어요. ${e.message}`);
      return false;
    } finally {
      setSaving(false);
    }
  };

  // 다음 재료를 이어서 넣을 때 (보관 방법·단위는 그대로 둠)
  const reset = () => {
    setIngredient("");
    setQuantity(1);
    setPickedExpiry(null);
  };

  return {
    today, catalog, known: Boolean(known), shelfLife,
    ingredient, setIngredient, quantity, setQuantity, unit, setUnit, storage, setStorage,
    expiryDate, setPickedExpiry, saving, submit, reset,
  };
}
