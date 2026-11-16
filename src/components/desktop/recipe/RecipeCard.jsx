import { Link } from "react-router";
import Highlight from "../Highlight";

// 데스크탑 레시피 카드 (사진·제목·작성자·별점·리뷰 수). 레시피 목록 격자·상세의 "같은 분류의 다른 레시피"·통합 검색이 같이 씀
// highlight = 제목에서 표시할 검색어 (통합 검색). 스타일은 styles/desktop/recipes.css
const RecipeCard = ({ recipe: r, highlight }) => {
    const stars = Math.round(r.rating ?? 0);
    return (
        <Link to={`/recipe/${r.id}`} className="drecipe-card">
            <span className="drecipe-photo">
                {r.image_url && <img src={r.image_url} alt="" loading="lazy" referrerPolicy="no-referrer" />}
            </span>
            <span className="drecipe-body">
                <strong className="drecipe-title"><Highlight text={r.title} word={highlight} /></strong>
                <span className="drecipe-author">
                    <span className="drecipe-avatar" aria-hidden="true" />
                    {r.author ?? "알 수 없음"}
                </span>
                <span className="drecipe-rating">
                    <span className="drecipe-stars" aria-hidden="true">
                        {[0, 1, 2, 3, 4].map((i) => <span key={i} className={i < stars ? "on" : undefined}>★</span>)}
                    </span>
                    {r.rating != null ? `별점 ${r.rating}` : "별점 없음"} · 리뷰 {r.review_count.toLocaleString()}개
                </span>
            </span>
        </Link>
    );
};

export default RecipeCard;
