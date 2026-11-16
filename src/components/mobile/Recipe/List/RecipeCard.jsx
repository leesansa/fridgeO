import { useNavigate } from "react-router";

// 카드 안 별 5개의 x 위치 (카드 왼쪽 위 기준 px)
const STARS = [158, 172, 186, 200, 214];

// 레시피 카드 하나 (사진·제목·작성자·별점·리뷰 수). 누르거나 Enter 면 레시피 상세로
const RecipeCard = ({ recipe: r }) => {
    const navigate = useNavigate();
    const go = () => navigate(`/recipe/${r.id}`);
    const stars = Math.round(r.rating ?? 0);

    return (
        <article
            className="card"
            role="link"
            tabIndex={0}
            aria-label={`${r.title} 레시피 상세정보 보기`}
            onClick={go}
            onKeyDown={(e) => e.key === "Enter" && go()}
        >
            <span className="card-photo" style={{ left: 4, top: 4, width: 122, height: 122 }}>
                {r.image_url && <img src={r.image_url} alt="" loading="lazy" referrerPolicy="no-referrer" />}
            </span>
            <h3 className="card-title" style={{ left: 150, top: 9, width: 238, height: 42 }}>{r.title}</h3>
            <span className="avatar" style={{ left: 158, top: 62, width: 25, height: 25 }} />
            <span className="author" style={{ left: 194, top: 65, height: 19 }}>{r.author ?? "알 수 없음"}</span>
            <span className="sr-only">별점 {r.rating ?? 0}점, 리뷰 {r.review_count}개</span>
            {STARS.map((x, i) => (
                <span key={x} className={i < stars ? "star" : "star star--off"} style={{ left: x, top: 102, width: 13, height: 13 }} />
            ))}
            <span className="views" style={{ left: 238, top: 100, height: 18 }} aria-hidden="true">({r.review_count.toLocaleString()})</span>
        </article>
    );
};

export default RecipeCard;
