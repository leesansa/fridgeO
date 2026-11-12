import { useState } from "react";
import { useNavigate } from "react-router";
import { readRecentRecipes } from "../../utils/recentRecipes";

// 최근 본 레시피 (레시피 상세를 열 때 이 브라우저에 기록, 최신순 최대 10개). 누르면 그 레시피로
const RecentRecipes = () => {
  const navigate = useNavigate();
  const [recentRecipes] = useState(readRecentRecipes);

  return (
    <div className="mypage-card">
      <div className="mypage-section-title">최근 본 레시피 / 정보</div>
      {recentRecipes.length === 0 ? (
        <button type="button" className="mypage-soft-button" onClick={() => navigate("/recipe")}>
          아직 본 레시피가 없어요. 레시피 보러 가기 &gt;
        </button>
      ) : (
        <ul className="mypage-recent-list" aria-label="최근 본 레시피">
          {recentRecipes.map((r) => (
            <li key={r.id}>
              <button type="button" className="mypage-recent-card" onClick={() => navigate(`/recipe/${r.id}`)}>
                {r.image_url
                  ? <img src={r.image_url} alt="" referrerPolicy="no-referrer" className="mypage-recent-thumb" />
                  : <span className="mypage-recent-thumb" />}
                <span className="mypage-recent-title">{r.title}</span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default RecentRecipes;
