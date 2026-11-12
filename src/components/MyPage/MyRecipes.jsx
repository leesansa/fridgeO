import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { apiFetch } from "../../utils/auth";

// 내가 쓴 레시피 (GET /api/me/recipes): 눌러서 보기 + 수정 + 삭제. 작성자 확인은 서버가 로그인 계정으로 함
const MyRecipes = () => {
  const navigate = useNavigate();
  const [recipes, setRecipes] = useState(null); // 불러오기 전 null
  const [error, setError] = useState("");
  const [deleting, setDeleting] = useState(null); // 지우는 중인 레시피 id (두 번 눌러도 한 번만)

  useEffect(() => {
    apiFetch("/api/me/recipes").then(setRecipes).catch((e) => setError(e.message));
  }, []);

  const remove = async (recipe) => {
    if (!window.confirm(`"${recipe.title}" 레시피를 삭제할까요? 리뷰와 북마크도 함께 지워지고 되돌릴 수 없어요.`)) return;
    setDeleting(recipe.id);
    setError("");
    try {
      await apiFetch(`/api/recipes/${recipe.id}`, { method: "DELETE" });
      setRecipes((list) => list.filter((r) => r.id !== recipe.id));
    } catch (e) {
      setError(e.message);
    } finally {
      setDeleting(null);
    }
  };

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
