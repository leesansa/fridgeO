import { useNavigate } from "react-router";
import { useMyRecipes } from "../../../utils/useMyRecipes";

// 내가 쓴 레시피 (useMyRecipes, 데스크탑과 공통): 눌러서 보기 + 수정 + 삭제
const MyRecipes = () => {
  const navigate = useNavigate();
  const { recipes, error, deleting, remove } = useMyRecipes();

  return (
    <div className="mypage-card">
      <div className="mypage-section-title">내가 쓴 레시피</div>
      {error && <p className="mypage-my-error" role="alert">{error}</p>}
      {recipes === null ? (
        !error && <p className="mypage-my-empty" role="status">불러오는 중...</p>
      ) : recipes.length === 0 ? (
        <button type="button" className="mypage-soft-button" onClick={() => navigate("/recipe/new")}>
          아직 쓴 레시피가 없어요. 레시피 쓰러 가기 &gt;
        </button>
      ) : (
        <ul className="mypage-my-list" aria-label="내가 쓴 레시피">
          {recipes.map((r) => (
            <li key={r.id} className="mypage-my-row">
              <button type="button" className="mypage-my-open" onClick={() => navigate(`/recipe/${r.id}`)}>
                {r.image_url ? <img src={r.image_url} alt="" className="mypage-my-thumb" /> : <span className="mypage-my-thumb" />}
                <span className="mypage-my-title">{r.title}</span>
              </button>
              <button type="button" className="mypage-my-btn" onClick={() => navigate(`/recipe/${r.id}/edit`)}>수정</button>
              <button type="button" className="mypage-my-btn is-danger" disabled={deleting === r.id} onClick={() => remove(r)}>
                {deleting === r.id ? "삭제 중" : "삭제"}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default MyRecipes;
