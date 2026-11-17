import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Outlet, useLocation, useNavigate } from "react-router";
import Navigation from "./mobile/Navigation";
import DesktopHeader from "./desktop/DesktopHeader";
import Loading from "../pages/mobile/Loading";
import { authClient } from "../utils/auth";
import { clearAccountData } from "../queries/queryClient";
import { useClearNotifications, useMarkNotificationsRead, useNotifications } from "../queries/notifications";
import { getExpiryBadge, getTodayKey } from "../utils/date";

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
// type·read 는 데스크탑 알림센터의 종류별 거르기·"새 알림" 표시용
const toCard = (n) => ({
    id: n.id,
    type: n.type,
    read: n.read,
    title: TITLES[n.type] ?? "알림",
    message: n.message,
    time: timeAgo(n.created_at),
    badge: n.expiry_date ? getExpiryBadge(n.expiry_date, getTodayKey()) : null,
});

const Layout = () => {
    const [loading, setLoading] = useState(true);
    // 페이지를 옮겨 다녀도 Layout은 유지되므로 알림을 여기서 받아 Outlet context로 나눠준다
    const { pathname } = useLocation();

    // DB 알림(notifications). 페이지를 옮길 때마다 다시 받아서, 냉장고에 기한 임박 재료를 넣고 오면 바로 종에 표시됨
    // 서버가 받을 때 기한 5일 이하 재료의 알림을 만든다. 로그인 안 했으면 알림 없음
    const { data: session, isPending } = authClient.useSession();
    const loggedIn = Boolean(session?.session);
    const navigate = useNavigate();

    // 로그아웃하거나 다른 계정으로 바뀌면 이전 계정의 캐시(내 정보·재료·북마크 등)를 지운다
    const userId = isPending ? undefined : session?.user.id ?? null;
    const prevUserId = useRef(undefined);
    useEffect(() => {
        if (userId === undefined) return;
        if (prevUserId.current !== undefined && prevUserId.current !== userId) clearAccountData();
        prevUserId.current = userId;
    }, [userId]);

    // 가입 1단계만 하고 나간 계정(휴대폰 번호 없음)은 어느 페이지에서든 가입 2단계로 돌려보낸다
    useEffect(() => {
        if (loggedIn && !session.user.phoneNumber && pathname !== "/signup") navigate("/signup", { replace: true });
    }, [loggedIn, session, pathname, navigate]);
    const { data: noti, refetch } = useNotifications();
    // 페이지를 옮길 때마다 다시 받음 (서버가 받을 때 그날 기한 임박 알림을 만들기 때문). 로그아웃이면 받지 않음
    useEffect(() => {
        if (loggedIn) refetch();
    }, [pathname, loggedIn, refetch]);
    const notifications = useMemo(() => (loggedIn && noti ? noti.items.map(toCard) : []), [loggedIn, noti]);
    const hasUnread = loggedIn && noti?.unread > 0;

    // 알림센터를 열면 모두 읽음으로 저장하고 메인의 빨간 점을 끈다
    const { mutate: markRead } = useMarkNotificationsRead();
    const markAllRead = useCallback(() => markRead(undefined, { onError: (e) => console.error("읽음 처리 실패", e) }), [markRead]);

    // 전체삭제: 화면에서 먼저 비우고 DB 에 지운 시각 기록, 실패하면 되돌림
    const { mutate: clear } = useClearNotifications();
    const clearAll = useCallback(() => clear(undefined, { onError: (e) => alert(`알림을 지우지 못했어요. ${e.message}`) }), [clear]);

    useEffect(() => {
        const timer = setTimeout(() => setLoading(false), LOADING_MS);
        return () => clearTimeout(timer);
    }, []);

    if (loading) return <Loading />;

    return <>
    <DesktopHeader hasUnread={hasUnread}/>
    <Outlet context={{ notifications, hasUnread, markAllRead, clearAll }}/>
    <Navigation/>
    </>
};

export default Layout;
