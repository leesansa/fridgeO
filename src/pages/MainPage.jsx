import { useEffect, useRef } from "react";
import { useNavigate, useOutletContext } from "react-router";
import "../styles/MainPage.css";
import "../vendor/lucian-icons/bell.js";
import FridgeAlerts from "../components/MainPage/FridgeAlerts.jsx";
import Condiments from "../components/MainPage/Condiments.jsx";
import Recommends from "../components/MainPage/Recommends.jsx";

// assets/main의 이미지를 한 번에 불러와 확장자를 뺀 파일명으로 꺼낸다 (예: eggs-photo.jpg → "eggs-photo")
const images = Object.fromEntries(
    Object.entries(import.meta.glob("../assets/main/*", { eager: true, import: "default" }))
        .map(([path, url]) => [path.split("/").pop().replace(/\.\w+$/, ""), url]),
);
const { logo, search, add, bell } = images;

const MainPage = () => {
    const navigate = useNavigate();
    const { hasUnread } = useOutletContext();
    const bellRef = useRef(null);

    // 확인 안 한 알림이 있는 동안 종을 3초마다 흔든다 (움직임 줄이기 설정이면 아이콘이 알아서 생략)
    useEffect(() => {
        if (!hasUnread) return;
        const bell = bellRef.current;
        bell.play();
        const timer = setInterval(() => bell.play(), 3000);
        return () => clearInterval(timer);
    }, [hasUnread]);

    return (
        <div className="main-page">
            <header className="main-header">
                <img className="main-logo" src={logo} alt="fridgeO" />
                <button type="button" className="main-bell" aria-label={hasUnread ? "알림, 새 알림 있음" : "알림"} onClick={() => navigate("/notification")}>
                    <lucian-bell size="34" ref={bellRef} />
                    {hasUnread && <span className="main-bell-dot" aria-hidden="true" />}
                </button> 
                <label className="main-search">
                    <img src={search} alt="" />
                    <input type="text" name="search" placeholder="레시피나 재료를 검색해보세요" aria-label="레시피나 재료 검색" />
                </label>
            </header>

            <main className="main-panel">
                <FridgeAlerts />
                <Condiments />
                <Recommends />
            </main>

            <button type="button" className="main-add" aria-label="추가" onClick={() => navigate("/ingredient")}>
                <img src={add} alt="" />
            </button>
        </div>
    );
};

export default MainPage;
