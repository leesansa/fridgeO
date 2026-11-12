import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { apiFetch } from "../../utils/auth";
import chevron from "../../assets/main/chevron.png";

// 메인 추천 레시피 5개 (GET /api/recipes/recommend): 내 냉장고 재료로 만들 수 있는 것 먼저, 없으면 인기순
// 가로로 스크롤해서 보고, 누르면 레시피 상세로. 스타일은 MainPage.css
const Recommends = () => {
    const navigate = useNavigate();
    const [recipes, setRecipes] = useState(null); // 불러오기 전 null
    const [error, setError] = useState("");

    useEffect(() => {
        let alive = true;
        apiFetch("/api/recipes/recommend")
            .then((rows) => alive && setRecipes(rows))
            .catch((e) => alive && setError(e.message));
        return () => { alive = false; };
    }, []);

    return (
        <section className="main-section recommend-section">
            <h2 className="section-title recommend-title">주인님을 기다리는 친구들이 있어요!!</h2>
            {error || recipes?.length === 0 ? (
                <p className="recommend-status">{error ? "추천 레시피를 불러오지 못했어요." : "추천할 레시피가 없어요."}</p>
            ) : !recipes ? (
                <p className="recommend-status">추천 레시피를 고르는 중…</p>
            ) : (
                <ul className="recommend-list" aria-label="추천 레시피">
                    {recipes.map((r) => (
                        <li key={r.id}>
                            <button type="button" className="recommend-card" onClick={() => navigate(`/recipe/${r.id}`)}>
                                <span className="recommend-image">
                                    <img src={r.image_url} alt="" referrerPolicy="no-referrer" loading="lazy" />
                                </span>
                                <span className="recommend-name">{r.title}</span>
                                <span className="recommend-desc">
                                    {r.reason
                                        ? `냉장고 속 '${r.reason}'(으)로 만들 수 있어요`
                                        : r.rating != null ? `★ ${r.rating} · 리뷰 ${r.review_count}개` : "새로 올라온 레시피예요"}
                                    <br />
                                    레시피 지금바로 보기
                                    <img className="chevron recommend-chevron" src={chevron} alt="" />
                                </span>
                            </button>
                        </li>
                    ))}
                </ul>
            )}
        </section>
    );
};

export default Recommends;
