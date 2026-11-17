// 레시피의 리뷰·북마크·작성자 팔로우 (server/routes/reviews.js)
import { apiFetch, seg } from "./client";

// offset 부터 몇 개씩 → { items, nextOffset }
export const getReviews = (recipeId, offset = 0) => apiFetch(`/api/recipes/${seg(recipeId)}/reviews?offset=${offset}`);

// 이 레시피에 쓴 내 리뷰 (없으면 null)
export const getMyReview = (recipeId) => apiFetch(`/api/recipes/${seg(recipeId)}/review`);

// { rating, comment } 로 작성 또는 수정
export const saveMyReview = (recipeId, body) => apiFetch(`/api/recipes/${seg(recipeId)}/review`, { method: "PUT", body });

export const deleteMyReview = (recipeId) => apiFetch(`/api/recipes/${seg(recipeId)}/review`, { method: "DELETE" });

// on = true 면 북마크/팔로우, false 면 해제
export const setBookmark = (recipeId, on) => apiFetch(`/api/recipes/${seg(recipeId)}/bookmark`, { method: on ? "PUT" : "DELETE" });

export const setFollow = (recipeId, on) => apiFetch(`/api/recipes/${seg(recipeId)}/follow`, { method: on ? "PUT" : "DELETE" });
