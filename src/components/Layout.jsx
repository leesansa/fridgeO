import { useEffect, useState } from "react";
import { Outlet } from "react-router";
import Navigation from "./Navigation";
import Loading from "../pages/Loading";

// shortcut: 실제로 불러올 데이터가 없어 고정 시간만 보여줌, 데이터 로딩이 생기면 그 완료 시점으로 교체
const LOADING_MS = 2000;

// shortcut: 서버가 없어 예시 알림을 화면 안에 둠, 새로고침하면 되돌아감 → 알림 API가 생기면 그 데이터로 교체
const sampleNotifications = [
    { id: 1, title: "유통기한 임박", message: "우유의 유통기한이 2일 남았어요", time: "방금 전" },
    { id: 2, title: "재고 부족", message: "계란이 1개 남았어요. 새로 채워주세요", time: "1시간 전" },
    { id: 3, title: "레시피 추천", message: "냉장고 속 두부로 만들 수 있는 요리가 있어요", time: "어제" },
];

const Layout = () => {
    const [loading, setLoading] = useState(true);
    // 페이지를 옮겨 다녀도 Layout은 유지되므로 알림 상태를 여기 두고 Outlet context로 나눠준다
    const [notifications, setNotifications] = useState(sampleNotifications);
    const [hasUnread, setHasUnread] = useState(sampleNotifications.length > 0);

    useEffect(() => {
        const timer = setTimeout(() => setLoading(false), LOADING_MS);
        return () => clearTimeout(timer);
    }, []);

    if (loading) return <Loading />;

    return <>
    <Outlet context={{ notifications, setNotifications, hasUnread, setHasUnread }}/>
    <Navigation/>
    </>
};

export default Layout;
