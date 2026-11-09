import { Link, useNavigate } from "react-router";
import line from "../../assets/main/line.svg";
import chevron from "../../assets/main/chevron.png";
import expiry from "../../assets/main/expiry.png";
import restock from "../../assets/main/restock.png";
import eggs from "../../assets/main/eggs.png";
import milk from "../../assets/main/milk.png";

// 화면 출력용 정적 데이터 (Figma 메인페이지_2 기준), 스타일은 MainPage.css
const fridgeAlerts = [
    { status: "확인!", tone: "warn", title: "유통기한 임박 상품", desc: "3개 있음", icon: expiry, iconPos: { left: 127, top: 25 } },
    { status: "확인!", tone: "warn", title: "새로 채워야하는 상품", desc: "1개 있음", icon: restock, iconPos: { left: 128, top: 24 } },
    { status: "정상", tone: "ok", title: "계란", desc: "상태양호함", icon: eggs, iconPos: { left: 117, top: 27 } },
    { status: "정상", tone: "ok", title: "유제품", desc: "선도 관리중...", icon: milk, iconPos: { left: 128, top: 25 } },
];

const FridgeAlerts = () => {
    const navigate = useNavigate();

    return (
        <section className="main-section fridge-section">
            <h2 className="section-title fridge-title">지금 확인해야할 내 재료들!</h2>
            <img className="divider" src={line} alt="" />
            <div className="fridge-grid">
                {fridgeAlerts.map((alert) => (
                    <button type="button" className="fridge-card" key={alert.title} onClick={() => navigate("/fridge")}>
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
    );
};

export default FridgeAlerts;
