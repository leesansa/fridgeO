// 알림 (server/routes/notifications.js). 로그인 필요
import { apiFetch } from "./client";

// → { items, unread }
export const getNotifications = () => apiFetch("/api/notifications");

export const markNotificationsRead = () => apiFetch("/api/notifications/read", { method: "POST" });

export const clearNotifications = () => apiFetch("/api/notifications", { method: "DELETE" });
