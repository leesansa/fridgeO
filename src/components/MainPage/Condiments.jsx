import { useNavigate } from "react-router";
import chevron from "../../assets/main/chevron.png";
import ketchup from "../../assets/main/ketchup.png";
import pepper from "../../assets/main/pepper.png";
import salt from "../../assets/main/salt.png";
import mayo from "../../assets/main/mayo.png";
import chili from "../../assets/main/chili.png";
import herbs from "../../assets/main/herbs.png";

// 화면 출력용 정적 데이터 (Figma 메인페이지_2 기준), 스타일은 MainPage.css
const condiments = [
    { name: "케첩", icon: ketchup },
    { name: "후추", icon: pepper },
    { name: "소금", icon: salt },
    { name: "마요네즈", icon: mayo },
    { name: "고추", icon: chili },
    { name: "허브", icon: herbs },
];

const Condiments = () => {
    const navigate = useNavigate();
    const goFridge = () => navigate("/fridge");

    return (
        <section className="main-section condiment-section">
            <div className="condiment-head">
                <span>내 조미료들 한눈에 보기</span>
                <button type="button" className="condiment-more" onClick={goFridge}>
                    더보기
                    <img className="chevron" src={chevron} alt="" />
                </button>
            </div>
            <ul className="condiment-list">
                {condiments.map((condiment) => (
                    <li key={condiment.name}>
                        {/* 누르면 냉장고에서 이 조미료 이름으로 바로 걸러서 보여 줌 (없으면 "검색한 재료가 없어요") */}
                        <button
                            type="button"
                            className="condiment-item"
                            aria-label={`내 냉장고에서 ${condiment.name} 보기`}
                            onClick={() => navigate(`/fridge?${new URLSearchParams({ q: condiment.name })}`)}
                        >
                            <img src={condiment.icon} alt="" />
                        </button>
                    </li>
                ))}
            </ul>
        </section>
    );
};

export default Condiments;
