import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { apiFetch } from "../../utils/auth";
import chevron from "../../assets/main/chevron.png";

// 메인 "내 조미료들": 내 냉장고에 있는 조미료만 (DB 재료 사전의 분류 = 조미료). 스타일은 MainPage.css
// 하나도 없거나 로그인 전이면 이 영역을 아예 안 보여 줌. 아이콘을 누르면 냉장고에서 그 조미료만, 더보기는 조미료 전체
const Condiments = () => {
    const navigate = useNavigate();
    const [condiments, setCondiments] = useState([]); // [{ name, icon_url }]

    useEffect(() => {
        apiFetch("/api/fridge/condiments").then(setCondiments).catch(() => {});
    }, []);

    if (condiments.length === 0) return null;

    // 더보기: 조미료 전체, 아이콘: 그 조미료 이름으로 검색까지 한 채로
    const goFridge = (name) => navigate(`/fridge?${new URLSearchParams({ category: "조미료", ...(name && { q: name }) })}`);

    return (
        <section className="main-section condiment-section">
            <div className="condiment-head">
                <span>내 조미료들 한눈에 보기</span>
                <button type="button" className="condiment-more" onClick={() => goFridge()}>
                    더보기
                    <img className="chevron" src={chevron} alt="" />
                </button>
            </div>
            <ul className="condiment-list">
                {condiments.map((condiment) => (
                    <li key={condiment.name}>
                        <button type="button" className="condiment-item" aria-label={`내 냉장고에서 ${condiment.name} 보기`} onClick={() => goFridge(condiment.name)}>
                            <img src={condiment.icon_url} alt="" />
                        </button>
                        <span className="condiment-name">{condiment.name}</span>
                    </li>
                ))}
            </ul>
        </section>
    );
};

export default Condiments;
