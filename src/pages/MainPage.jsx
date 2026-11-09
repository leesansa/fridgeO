import { useNavigate } from "react-router";
import "../styles/MainPage.css";
import FridgeAlerts from "../components/MainPage/FridgeAlerts.jsx";
import Condiments from "../components/MainPage/Condiments.jsx";
import Recommends from "../components/MainPage/Recommends.jsx";
import "../vendor/lucian-icons/bell.js";

// assets/main의 이미지를 한 번에 불러와 확장자를 뺀 파일명으로 꺼낸다 (예: eggs-photo.jpg → "eggs-photo")
const images = Object.fromEntries(
    Object.entries(import.meta.glob("../assets/main/*", { eager: true, import: "default" }))
        .map(([path, url]) => [path.split("/").pop().replace(/\.\w+$/, ""), url]),
);
const { logo, search, add } = images;

const MainPage = () => {
    const navigate = useNavigate();

    return (
        <div className="main-page">
            <header className="main-header">
                <img className="main-logo" src={logo} alt="fridgeO" />
                <button type="button" className="main-bell" aria-label="알림" onClick={() => navigate("/notification")}>
                    <lucian-bell size="34" />
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

            <button type="button" className="main-add" aria-label="추가">
                <img src={add} alt="" />
            </button>
        </div>
    );
};

export default MainPage;
