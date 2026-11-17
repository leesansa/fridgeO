// 내 냉장고 재료·재료 사전·메인 요약 (server/routes/ingredients.js)
import { apiFetch, seg, toQuery } from "./client";

// 재료 사전 [{ name, shelf_life_days }]
export const getIngredientCatalog = () => apiFetch("/api/ingredient-catalog");

// params = { sort, q, category, storage, status, offset } → { items, total, nextOffset }
export const getIngredients = (params) => apiFetch(`/api/ingredients?${toQuery(params)}`);

export const getIngredient = (id) => apiFetch(`/api/ingredients/${seg(id)}`);

// body = { name, quantity, unit, storage, expiryDate }
export const createIngredient = (body) => apiFetch("/api/ingredients", { method: "POST", body });

// 등록과 같은 전체 값을 받음
export const updateIngredient = (id, body) => apiFetch(`/api/ingredients/${seg(id)}`, { method: "PATCH", body });

export const deleteIngredient = (id) => apiFetch(`/api/ingredients/${seg(id)}`, { method: "DELETE" });

// 내 조미료
export const getCondiments = () => apiFetch("/api/fridge/condiments");

// 메인 냉장고 카드용 요약
export const getFridgeSummary = () => apiFetch("/api/fridge/summary");
