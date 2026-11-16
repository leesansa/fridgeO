import { useEffect, useRef } from "react";
import { useNavigate, useOutletContext } from "react-router";
import "../../styles/mobile/MainPage.css";
import "../../styles/desktop/MainPage.css"; // 모바일 뒤에 불러와야 1024px 이상에서 덮어씀
import "../../vendor/lucian-icons/bell.js";
import FridgeAlerts from "../../components/mobile/MainPage/FridgeAlerts.jsx";
import Condiments from "../../components/mobile/MainPage/Condiments.jsx";
import Recommends from "../../components/mobile/MainPage/Recommends.jsx";
import MainSearch from "../../components/mobile/MainPage/MainSearch.jsx";
import logo from "../../assets/main/logo.png";
import add from "../../assets/main/add.png";

const MainPage = () => {
    const navigate = useNavigate();
    const { hasUnread } = useOutletContext();
    const bellRef = useRef(null);

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
                <MainSearch />
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
