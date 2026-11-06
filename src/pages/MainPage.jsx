import "../styles/MainPage.css";
import FridgeAlerts from "../components/MainPage/FridgeAlerts.jsx";
import "../vendor/lucian-icons/bell.js";

// assets/main의 이미지를 한 번에 불러와 확장자를 뺀 파일명으로 꺼낸다 (예: eggs-photo.jpg → "eggs-photo")
const images = Object.fromEntries(
    Object.entries(import.meta.glob("../assets/main/*", { eager: true, import: "default" }))
        .map(([path, url]) => [path.split("/").pop().replace(/\.\w+$/, ""), url]),
);
const {
    logo, search, chevron,
    ketchup, pepper, salt, mayo, chili, herbs, tofu, "eggs-photo": eggsPhoto,
    add,
} = images;

const MainPage = () => {
    return (
        <div className="main-page">
            <header className="main-header">
                <img className="main-logo" src={logo} alt="fridgeO" />
                <button type="button" className="main-bell" aria-label="알림">
                    <lucian-bell size="34" />
                </button>
                <label className="main-search">
                    <img src={search} alt="" />
                    <input type="text" name="search" placeholder="레시피나 재료를 검색해보세요" aria-label="레시피나 재료 검색" />
                </label>
            </header>

            <main className="main-panel">
                <section className="main-section fridge-section">
                    <h2 className="section-title fridge-title">지금 확인해야할 내 재료들!</h2>
                    <img className="divider" src={line} alt="" />
                    <div className="fridge-grid">
                        {fridgeAlerts.map((alert) => (
                            <button type="button" className="fridge-card" key={alert.title}>
                                <span className={`fridge-status ${alert.tone}`}>{alert.status}</span>
                                <span className="fridge-name">{alert.title}</span>
                                <span className="fridge-desc">{alert.desc}</span>
                                <img className="fridge-icon" src={alert.icon} alt="" style={alert.iconPos} />
                            </button>
                        ))}
                    </div>
                    <img className="divider" src={line} alt="" />
                    <Link to="/fridge" className="fridge-more">
                        <span className="fridge-more-text">
                            <strong>냉장고관리 </strong>에서 더보기
                        </span>
                        <img className="chevron" src={chevron} alt="" />
                    </Link>
                </section>

                <section className="main-section condiment-section">
                    <div className="condiment-head">
                        <span>내 조미료들 한눈에 보기</span>
                        <button type="button" className="condiment-more">
                            더보기
                            <img className="chevron" src={chevron} alt="" />
                        </button>
                    </div>
                    <ul className="condiment-list">
                        {condiments.map((condiment) => (
                            <li key={condiment.name}>
                                <button type="button" className="condiment-item" aria-label={condiment.name}>
                                    <img src={condiment.icon} alt="" />
                                </button>
                            </li>
                        ))}
                    </ul>
                </section>

                <section className="main-section recommend-section">
                    <h2 className="section-title recommend-title">주인님을 기다리는 친구들이 있어요!!</h2>
                    <div className="recommend-list">
                        {recommends.map((recommend) => (
                            <button type="button" className="recommend-card" key={recommend.title}>
                                <span className="recommend-image">
                                    <img src={recommend.image} alt="" style={{ width: recommend.imageWidth }} />
                                </span>
                                <span className="recommend-name">{recommend.title}</span>
                                <span className="recommend-desc">
                                    {recommend.lines[0]}
                                    <br />
                                    {recommend.lines[1]}
                                </span>
                                <img className="chevron recommend-chevron" src={chevron} alt="" />
                            </button>
                        ))}
                    </div>
                </section>
            </main>

            <button type="button" className="main-add" aria-label="추가">
                <img src={add} alt="" />
            </button>
        </div>
    );
};

export default MainPage;
