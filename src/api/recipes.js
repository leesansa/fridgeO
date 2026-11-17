// 레시피·분류 (server/routes/recipes.js)
import { apiFetch, seg, toQuery } from "./client";

export const getCategories = () => apiFetch("/api/categories");

// params = { q, category, cursor } → { items, nextCursor }
export const getRecipes = (params) => apiFetch(`/api/recipes?${toQuery(params)}`);

// 내 냉장고 재료로 만들 수 있는 추천 레시피
export const getRecommendedRecipes = () => apiFetch("/api/recipes/recommend");

export const getRecipe = (id) => apiFetch(`/api/recipes/${seg(id)}`);

export const createRecipe = (body) => apiFetch("/api/recipes", { method: "POST", body });

export const updateRecipe = (id, body) => apiFetch(`/api/recipes/${seg(id)}`, { method: "PUT", body });

export const deleteRecipe = (id) => apiFetch(`/api/recipes/${seg(id)}`, { method: "DELETE" });
