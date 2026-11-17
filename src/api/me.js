// 내 프로필·설정·북마크·내 레시피·팔로우 (server/routes/me.js). 모두 로그인 필요
import { apiFetch } from "./client";

export const getMe = () => apiFetch("/api/me");

// 프로필 행 만들기 (이미 있으면 그대로). body = { name } (닉네임, 없어도 됨)
export const createProfile = (body = {}) => apiFetch("/api/me", { method: "POST", body });

// body = { name } 또는 { profileImage }
export const updateMe = (body) => apiFetch("/api/me", { method: "PATCH", body });

// body = { expiryAlert }
export const updateSettings = (body) => apiFetch("/api/me/settings", { method: "PATCH", body });

export const getMyBookmarks = () => apiFetch("/api/me/bookmarks");

export const getMyRecipes = () => apiFetch("/api/me/recipes");

// type = "following" | "followers"
export const getMyFollows = (type) => apiFetch(`/api/me/follows?type=${encodeURIComponent(type)}`);
