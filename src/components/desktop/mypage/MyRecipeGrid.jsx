import { Link, useNavigate } from "react-router";
import { useMyRecipes } from "../../../utils/useMyRecipes";

// 데스크탑 마이페이지 "내가 쓴 레시피": 카드 격자 + 카드마다 수정·삭제 (로직은 모바일과 같은 useMyRecipes)
const MyRecipeGrid = () => {
    const navigate = useNavigate();
    const { recipes, error, deleting, remove } = useMyRecipes();

    return (
        <section className="dmypage-section" aria-labelledby="dmypage-my-title">
            <div className="dmypage-section-head">
                <h2 id="dmypage-my-title">내가 쓴 레시피 {recipes && <span>{recipes.length}</span>}</h2>
                <Link to="/recipe/new" className="dmypage-head-link">+ 레시피 쓰기</Link>
            </div>
            {error && <p className="dmypage-note" role="alert">{error}</p>}
            {recipes === null ? (
                !error && <p className="dmypage-note" role="status">불러오는 중...</p>
            ) : recipes.length === 0 ? (
                <p className="dmypage-note">아직 쓴 레시피가 없어요. 나만의 레시피를 올려 보세요.</p>
            ) : (
                <ul className="dmypage-grid">
                    {recipes.map((r) => (
                        <li key={r.id} className="dmypage-my">
                            <Link to={`/recipe/${r.id}`} className="dmypage-my-link">
                                <span className="dmypage-thumb">
                                    {r.image_url && <img src={r.image_url} alt="" loading="lazy" referrerPolicy="no-referrer" />}
                                </span>
                                <strong>{r.title}</strong>
                            </Link>
                            <div className="dmypage-my-actions">
                                <button type="button" onClick={() => navigate(`/recipe/${r.id}/edit`)}>수정</button>
                                <button type="button" className="is-danger" disabled={deleting === r.id} onClick={() => remove(r)}>
                                    {deleting === r.id ? "삭제 중" : "삭제"}
                                </button>
                            </div>
                        </li>
                    ))}
                </ul>
            )}
        </section>
    );
};

export default MyRecipeGrid;
