import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { apiFetch } from "../../utils/auth";

// 북마크·팔로우 숫자를 누르면 펼쳐지는 목록 (DB recipe_bookmarks / follows)
const StatPanel = ({ kind, me }) => {
  const navigate = useNavigate();
  const [followType, setFollowType] = useState("following"); // 팔로잉 | 팔로워
  const path = kind === "bookmarks" ? "/api/me/bookmarks" : `/api/me/follows?type=${followType}`;
  // 응답을 어느 주소 것인지와 함께 보관 → 탭을 바꾸면 자동으로 "불러오는 중"
  const [loaded, setLoaded] = useState({ path: null, rows: [], error: "" });

  useEffect(() => {
    let ignore = false;
    apiFetch(path)
      .then((rows) => !ignore && setLoaded({ path, rows, error: "" }))
      .catch((e) => !ignore && setLoaded({ path, rows: [], error: e.message }));
    return () => { ignore = true; };
  }, [path]);

  const loading = loaded.path !== path;
  const empty = kind === "bookmarks"
    ? "아직 북마크한 레시피가 없어요. 레시피 사진 아래 북마크를 눌러 보세요."
    : followType === "following" ? "아직 팔로우한 사람이 없어요." : "아직 나를 팔로우한 사람이 없어요.";

  return (
    <div className="mypage-card" id="mypage-stat-panel">
      {kind === "follows" && (
        <div className="mypage-tabs" role="tablist" aria-label="팔로우 현황">
          {[["following", "팔로잉", me.following_count], ["followers", "팔로워", me.follower_count]].map(([type, label, count]) => (
            <button
              key={type}
              type="button"
              role="tab"
              aria-selected={followType === type}
              onClick={() => setFollowType(type)}
              className={`mypage-tab${followType === type ? " is-active" : ""}`}
            >
              {label} {count}
            </button>
          ))}
        </div>
      )}
      {loading && <p className="mypage-panel-note">불러오는 중...</p>}
      {!loading && loaded.error && <p className="mypage-panel-note" role="alert">{loaded.error}</p>}
      {!loading && !loaded.error && loaded.rows.length === 0 && <p className="mypage-panel-note">{empty}</p>}
      {!loading && loaded.rows.length > 0 && (
        <ul className="mypage-panel-list">
          {loaded.rows.map((row) => kind === "bookmarks" ? (
            <li key={row.id}>
              <button type="button" className="mypage-panel-row" onClick={() => navigate(`/recipe/${row.id}`)}>
                {row.image_url
                  ? <img src={row.image_url} alt="" referrerPolicy="no-referrer" className="mypage-panel-thumb" />
                  : <span className="mypage-panel-thumb" />}
                <span className="mypage-panel-text">{row.title}</span>
              </button>
            </li>
          ) : (
            <li key={row.id} className="mypage-panel-row">
              {row.profile_image_url
                ? <img src={row.profile_image_url} alt="" className="mypage-panel-thumb is-round" />
                : <span className="mypage-panel-thumb is-round" />}
              <span className="mypage-panel-text">{row.name}</span>
            </li>
          ))}
        </ul>
      )}
      {kind === "bookmarks" && !loading && loaded.rows.length > 0 && (
        <button type="button" className="mypage-soft-button" onClick={() => navigate("/bookmark")}>
          북마크 전체 보기 &gt;
        </button>
      )}
    </div>
  );
};

export default StatPanel;
