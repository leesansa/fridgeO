import { useEffect, useState } from "react";
import { apiFetch } from "./auth";

// 재료 사전 [{ name, shelf_life_days }]: 이름 자동완성과 유통기한 기본값에 씀
// 못 불러오면 빈 목록 (자동완성만 안 뜨고 직접 입력은 그대로 됨)
export function useIngredientCatalog() {
  const [catalog, setCatalog] = useState([]);
  useEffect(() => {
    apiFetch("/api/ingredient-catalog").then(setCatalog).catch(() => {});
  }, []);
  return catalog;
}
