import { useCallback, useEffect, useState } from "react";
import { Outlet, useLocation } from "react-router";
import Navigation from "./Navigation";
import Loading from "../pages/Loading";
import { apiFetch, isLoggedIn } from "../utils/auth";
import { getExpiryBadge, getTodayKey } from "../utils/fridgeUtils";

// shortcut: 실제로 불러올 데이터가 없어 고정 시간만 보여줌, 데이터 로딩이 생기면 그 완료 시점으로 교체
const LOADING_MS = 2000;

const TITLES = { expiry: "유통기한 임박", follow: "새 팔로워", review: "새 리뷰" };

// "방금 전" / "12분 전" / "3시간 전" / "어제" / "2026. 11. 9."
const timeAgo = (iso) => {
    const minutes = Math.floor((Date.now() - Date.parse(iso)) / 60_000);
    if (minutes < 1) return "방금 전";
    if (minutes < 60) return `${minutes}분 전`;
    if (minutes < 24 * 60) return `${Math.floor(minutes / 60)}시간 전`;
    if (minutes < 48 * 60) return "어제";
    return new Date(iso).toLocaleDateString("ko-KR");
};

// DB 알림 → 알림센터 카드. 유통기한 알림은 지금 기준 D-day 배지를 붙임 (만든 날이 아니라 오늘 기준)
const toCard = (n) => ({
    id: n.id,
    title: TITLES[n.type] ?? "알림",
    message: n.message,
    time: timeAgo(n.created_at),
    badge: n.expiry_date ? getExpiryBadge(n.expiry_date, getTodayKey()) : null,
});

const Layout = () => {
    const [loading, setLoading] = useState(true);
    // 페이지를 옮겨 다녀도 Layout은 유지되므로 알림 상태를 여기 두고 Outlet context로 나눠준다
    const [notifications, setNotifications] = useState([]);
    const [hasUnread, setHasUnread] = useState(false);
    const { pathname } = useLocation();

    // DB 알림(notifications). 페이지를 옮길 때마다 다시 받아서, 냉장고에 기한 임박 재료를 넣고 오면 바로 종에 표시됨
    // 서버가 받을 때 기한 5일 이하 재료의 알림을 만든다. 로그인 안 했으면 알림 없음
    useEffect(() => {
        let ignore = false;
        (async () => {
            const loggedIn = await isLoggedIn();
            const data = loggedIn ? await apiFetch("/api/notifications") : { items: [], unread: 0 };
            if (ignore) return;
            setNotifications(data.items.map(toCard));
            setHasUnread(data.unread > 0);
        })().catch((e) => console.error("알림을 불러오지 못했습니다", e));
        return () => { ignore = true; };
    }, [pathname]);

    // 알림센터를 열면 모두 읽음으로 저장하고 메인의 빨간 점을 끈다
    const markAllRead = useCallback(async () => {
        try {
            await apiFetch("/api/notifications/read", { method: "POST" });
            setHasUnread(false);
        } catch (e) {
            console.error("읽음 처리 실패", e);
        }
    }, []);

    // 전체삭제: 화면에서 먼저 비우고 DB 에 지운 시각 기록, 실패하면 되돌림
    const clearAll = useCallback(async () => {
        const before = notifications;
        setNotifications([]);
        try {
            await apiFetch("/api/notifications", { method: "DELETE" });
        } catch (e) {
            setNotifications(before);
            alert(`알림을 지우지 못했어요. ${e.message}`);
        }
    }, [notifications]);

    useEffect(() => {
        const timer = setTimeout(() => setLoading(false), LOADING_MS);
        return () => clearTimeout(timer);
    }, []);

    if (loading) return <Loading />;

    return <>
    <Outlet context={{ notifications, hasUnread, markAllRead, clearAll }}/>
    <Navigation/>
    </>
};

export default Layout;
