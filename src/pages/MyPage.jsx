import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router";
import Header from "../components/Header";
import { apiFetch, authClient } from "../utils/auth";
import { readRecentRecipes } from "../utils/recentRecipes";

const AVATAR_PX = 160; // 프로필 사진 저장 크기 (화면에는 72px, 선명하게 2배 남짓)

// 고른 사진을 가운데 기준 정사각형으로 잘라 160px JPEG data URL 로 줄임 (서버에 보낼 크기를 10KB 안팎으로)
async function toAvatarDataUrl(file) {
  const bitmap = await createImageBitmap(file);
  const side = Math.min(bitmap.width, bitmap.height);
  const canvas = document.createElement("canvas");
  canvas.width = canvas.height = AVATAR_PX;
  canvas.getContext("2d").drawImage(
    bitmap,
    (bitmap.width - side) / 2, (bitmap.height - side) / 2, side, side,
    0, 0, AVATAR_PX, AVATAR_PX,
  );
  bitmap.close();
  return canvas.toDataURL("image/jpeg", 0.85);
}

// 북마크·팔로우 숫자를 누르면 펼쳐지는 목록 (DB recipe_bookmarks / follows)
function StatPanel({ kind, me }) {
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
    <div style={styles.card} id="mypage-stat-panel">
      {kind === "follows" && (
        <div style={styles.tabs} role="tablist" aria-label="팔로우 현황">
          {[["following", "팔로잉", me.following_count], ["followers", "팔로워", me.follower_count]].map(([type, label, count]) => (
            <button
              key={type}
              type="button"
              role="tab"
              aria-selected={followType === type}
              onClick={() => setFollowType(type)}
              style={{ ...styles.tab, ...(followType === type ? styles.tabActive : null) }}
            >
              {label} {count}
            </button>
          ))}
        </div>
      )}
      {loading && <p style={styles.panelNote}>불러오는 중...</p>}
      {!loading && loaded.error && <p style={styles.panelNote} role="alert">{loaded.error}</p>}
      {!loading && !loaded.error && loaded.rows.length === 0 && <p style={styles.panelNote}>{empty}</p>}
      {!loading && loaded.rows.length > 0 && (
        <ul style={styles.panelList}>
          {loaded.rows.map((row) => kind === "bookmarks" ? (
            <li key={row.id}>
              <button type="button" style={styles.panelRow} onClick={() => navigate(`/recipe/${row.id}`)}>
                {row.image_url
                  ? <img src={row.image_url} alt="" referrerPolicy="no-referrer" style={styles.panelThumb} />
                  : <span style={styles.panelThumb} />}
                <span style={styles.panelText}>{row.title}</span>
              </button>
            </li>
          ) : (
            <li key={row.id} style={styles.panelRow}>
              {row.profile_image_url
                ? <img src={row.profile_image_url} alt="" style={{ ...styles.panelThumb, borderRadius: "50%" }} />
                : <span style={{ ...styles.panelThumb, borderRadius: "50%" }} />}
              <span style={styles.panelText}>{row.name}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default function MyPage() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  // 내 프로필(users 테이블) + 북마크·팔로잉·팔로워 수. 불러오기 전·실패 시엔 이름 자리를 비워 둔다
  const [me, setMe] = useState(null);
  const [openStat, setOpenStat] = useState(null); // "bookmarks" | "follows" | null (펼친 목록)
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef(null);
  const [recentRecipes] = useState(readRecentRecipes); // 이 브라우저에 기록된 최근 본 레시피

  useEffect(() => {
    apiFetch("/api/me").then(setMe).catch(() => setMe(null));
  }, []);

  // 사과(프로필)를 누르면 사진 고르기 → 줄여서 DB 에 저장. 사진이 없으면 계속 🍏
  const handlePhoto = async (event) => {
    const file = event.target.files[0];
    event.target.value = ""; // 같은 사진을 다시 골라도 onChange 가 오도록
    if (!file) return;
    setUploading(true);
    try {
      const profileImage = await toAvatarDataUrl(file);
      const saved = await apiFetch("/api/me", { method: "PATCH", body: { profileImage } });
      setMe((prev) => ({ ...prev, profile_image_url: saved.profile_image_url }));
    } catch (e) {
      alert(`프로필 사진을 바꾸지 못했어요. ${e.message}`);
    } finally {
      setUploading(false);
    }
  };

  const toggleStat = (kind) => setOpenStat((current) => (current === kind ? null : kind));

  const handleLogout = async () => {
    await authClient.signOut();
    navigate("/login");
  };

  return (
    <div style={styles.pageWrapper}>
      {/* 420 * 915 고정 프레임 */}
      <div style={styles.mobileContainer}>
        {/* 상단 검색 헤더 */}
        <Header backTo="/" value={searchQuery} onChange={setSearchQuery} />

        {/* 메인 컨텐츠 영역 */}
        <main style={styles.mainContent}>
          {/* 프로필 카드 */}
          <div
            style={{
              ...styles.card,
              display: "flex",
              alignItems: "center",
              gap: "18px",
            }}
          >
            <button
              type="button"
              style={{ ...styles.profileAvatar, opacity: uploading ? 0.5 : 1 }}
              aria-label={uploading ? "프로필 사진 저장 중" : "프로필 사진 바꾸기"}
              disabled={!me || uploading}
              onClick={() => fileRef.current.click()}
            >
              {me?.profile_image_url
                ? <img src={me.profile_image_url} alt="" style={styles.avatarImg} />
                : <span aria-hidden="true">🍏</span>}
              <span style={styles.avatarBadge} aria-hidden="true">✎</span>
            </button>
            <input ref={fileRef} type="file" accept="image/*" hidden onChange={handlePhoto} />
            <div>
              <div style={styles.profileName}>{me ? `${me.name} 님` : " "}</div>
              <div style={styles.profileSub}>오늘도 냉장고를 비워볼까요?</div>
            </div>
          </div>

          {/* 북마크 / 팔로우 (DB 숫자). 누르면 아래에 목록이 펼쳐짐 */}
          <div style={{ ...styles.card, display: "flex", padding: "14px 12px" }}>
            {[
              ["bookmarks", "북마크", me ? `${me.bookmark_count}개` : "-"],
              ["follows", "팔로우", me ? me.following_count : "-"],
            ].map(([kind, label, value], i) => (
              <div key={kind} style={{ display: "contents" }}>
                {i > 0 && <div style={styles.statDivider} />}
                <button
                  type="button"
                  style={{ ...styles.statItem, ...(openStat === kind ? styles.statItemActive : null) }}
                  aria-expanded={openStat === kind}
                  aria-controls="mypage-stat-panel"
                  disabled={!me}
                  onClick={() => toggleStat(kind)}
                >
                  <span style={styles.statNum}>{value}</span>
                  <span style={styles.statLabel}>{label} {openStat === kind ? "▴" : "▾"}</span>
                </button>
              </div>
            ))}
          </div>

          {me && openStat && <StatPanel key={openStat} kind={openStat} me={me} />}

          {/* 최근 본 레시피 (레시피 상세를 열 때 기록, 최신순 최대 10개). 누르면 그 레시피로 */}
          <div style={styles.card}>
            <div style={styles.sectionTitle}>최근 본 레시피 / 정보</div>
            {recentRecipes.length === 0 ? (
              <button type="button" style={styles.recentEmpty} onClick={() => navigate("/recipe")}>
                아직 본 레시피가 없어요. 레시피 보러 가기 &gt;
              </button>
            ) : (
              <ul style={styles.recentList} aria-label="최근 본 레시피">
                {recentRecipes.map((r) => (
                  <li key={r.id}>
                    <button type="button" style={styles.recipeMiniCard} onClick={() => navigate(`/recipe/${r.id}`)}>
                      {r.image_url
                        ? <img src={r.image_url} alt="" referrerPolicy="no-referrer" style={styles.recentThumb} />
                        : <span style={styles.recentThumb} />}
                      <span style={styles.recipeTitle}>{r.title}</span>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* 하단 메뉴 리스트 */}
          <div style={{ ...styles.card, padding: "20px 24px" }}>
            <div style={styles.menuRow}>
              <span style={styles.menuText}>내 냉장고 관리</span>
              <span style={styles.urgentBadgeSmall}>임박 2개 &gt;</span>
            </div>
            <div style={styles.menuDivider} />
            <div style={styles.menuRow}>
              <span style={styles.menuText}>개인정보 관리</span>
              <span style={styles.menuArrow}>&gt;</span>
            </div>
            <div style={styles.menuDivider} />
            <div style={styles.menuRow}>
              <span style={styles.menuText}>알림 설정 | 동의/약관</span>
              <span style={styles.menuArrow}>&gt;</span>
            </div>
            <div style={styles.menuDivider} />
            <button
              type="button"
              onClick={handleLogout}
              style={{ ...styles.menuRow, paddingBottom: 0, width: "100%", border: 0, background: "none", font: "inherit", cursor: "pointer" }}
            >
              <span style={styles.menuText}>로그아웃</span>
              <span style={styles.menuArrow}>&gt;</span>
            </button>
          </div>
        </main>

      </div>
    </div>
  );
}

const styles = {
  pageWrapper: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#E5E7EB",
    minHeight: "100vh",
    margin: 0,
    fontFamily: "'Pretendard', 'Noto Sans KR', sans-serif",
  },
  mobileContainer: {
    width: "420px",
    height: "915px",
    backgroundColor: "#F3F4F3",
    display: "flex",
    flexDirection: "column",
    justifyContent: "space-between",
    boxShadow: "0 10px 30px rgba(0,0,0,0.12)",
    overflow: "hidden",
    boxSizing: "border-box",
  },
  mainContent: {
    flex: 1,
    minHeight: 0,
    overflowY: "auto", // 북마크·팔로우 목록을 펼쳐도 아래 메뉴가 잘리지 않고 스크롤됨
    padding: "20px 26px 90px", // 아래쪽은 하단 바에 가리지 않게
    display: "flex",
    flexDirection: "column",
    gap: "20px",
    boxSizing: "border-box",
  },
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: "20px",
    padding: "22px 24px",
    boxShadow: "0 2px 8px rgba(0,0,0,0.02)",
  },
  profileAvatar: {
    position: "relative",
    width: "72px",
    height: "72px",
    padding: 0,
    border: "none",
    borderRadius: "50%",
    backgroundColor: "#86A96F",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "36px",
    flexShrink: 0,
    cursor: "pointer",
  },
  avatarImg: {
    width: "100%",
    height: "100%",
    borderRadius: "50%",
    objectFit: "cover",
  },
  // 사진을 바꿀 수 있다는 표시 (오른쪽 아래 작은 연필)
  avatarBadge: {
    position: "absolute",
    right: "-2px",
    bottom: "-2px",
    width: "24px",
    height: "24px",
    borderRadius: "50%",
    backgroundColor: "#FFFFFF",
    boxShadow: "0 1px 4px rgba(0,0,0,0.2)",
    color: "#4E7A36",
    fontSize: "13px",
    lineHeight: "24px",
    textAlign: "center",
  },
  profileName: {
    fontSize: "16px",
    fontWeight: "700",
    color: "#222",
    marginBottom: "6px",
  },
  profileSub: {
    fontSize: "13px",
    color: "#555",
  },
  // 북마크·팔로우 두 칸이 반씩 (구독 칸은 팔로워 현황과 겹쳐 뺌)
  statItem: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    flex: 1,
    padding: "8px 0",
    border: "none",
    borderRadius: "14px",
    // background 축약형을 쓰면 선택 해제 때 React 가 backgroundColor 를 지우며 회색 기본 버튼색이 드러남
    backgroundColor: "transparent",
    font: "inherit",
    cursor: "pointer",
  },
  statItemActive: {
    backgroundColor: "#EEF3E8",
  },
  statNum: {
    fontSize: "18px",
    fontWeight: "700",
    marginBottom: "6px",
    color: "#4E7A36",
  },
  statLabel: {
    fontSize: "13px",
    color: "#555",
  },
  statDivider: {
    width: "1px",
    margin: "6px 4px",
    backgroundColor: "#EAEAEA",
  },
  tabs: {
    display: "flex",
    gap: "6px",
    marginBottom: "12px",
  },
  tab: {
    flex: 1,
    height: "34px",
    border: "none",
    borderRadius: "10px",
    backgroundColor: "#F3F4F3",
    color: "#555",
    font: "inherit",
    fontSize: "13px",
    fontWeight: "700",
    cursor: "pointer",
  },
  tabActive: {
    backgroundColor: "#7FA766",
    color: "#FFFFFF",
  },
  panelNote: {
    margin: 0,
    fontSize: "13px",
    color: "#777",
    textAlign: "center",
  },
  panelList: {
    margin: 0,
    padding: 0,
    listStyle: "none",
    display: "flex",
    flexDirection: "column",
    gap: "10px",
  },
  panelRow: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    width: "100%",
    padding: 0,
    border: "none",
    background: "none",
    font: "inherit",
    textAlign: "left",
    cursor: "pointer",
  },
  panelThumb: {
    flexShrink: 0,
    width: "44px",
    height: "44px",
    borderRadius: "10px",
    objectFit: "cover",
    backgroundColor: "#E2D7D7",
  },
  panelText: {
    minWidth: 0,
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
    fontSize: "14px",
    fontWeight: "700",
    color: "#222",
  },
  sectionTitle: {
    fontSize: "14px",
    fontWeight: "700",
    color: "#333",
    marginBottom: "14px",
  },
  // 최근 본 레시피: 가로로 넘겨 보는 카드 줄 (두 장 반 정도 보여 옆으로 더 있다는 걸 알 수 있게)
  recentList: {
    display: "flex",
    gap: "12px",
    margin: 0,
    padding: "0 0 6px",
    listStyle: "none",
    overflowX: "auto",
    scrollSnapType: "x mandatory",
  },
  recipeMiniCard: {
    display: "flex",
    flexDirection: "column",
    gap: "8px",
    width: "128px",
    padding: "8px",
    border: "none",
    backgroundColor: "#F3F4F3",
    borderRadius: "16px",
    font: "inherit",
    textAlign: "left",
    cursor: "pointer",
    scrollSnapAlign: "start",
  },
  recentThumb: {
    display: "block",
    width: "112px",
    height: "80px",
    borderRadius: "10px",
    objectFit: "cover",
    backgroundColor: "#E2D7D7",
  },
  recipeTitle: {
    // 제목이 길어도 두 줄까지만
    display: "-webkit-box",
    WebkitBoxOrient: "vertical",
    WebkitLineClamp: 2,
    overflow: "hidden",
    wordBreak: "keep-all",
    fontSize: "13px",
    fontWeight: "700",
    lineHeight: "18px",
    color: "#222",
  },
  recentEmpty: {
    width: "100%",
    padding: "16px",
    border: "none",
    borderRadius: "16px",
    backgroundColor: "#F3F4F3",
    color: "#555",
    font: "inherit",
    fontSize: "13px",
    cursor: "pointer",
  },
  menuRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "10px 0",
    cursor: "pointer",
  },
  menuText: {
    fontSize: "14px",
    fontWeight: "700",
    color: "#222",
  },
  urgentBadgeSmall: {
    backgroundColor: "#C85A5A",
    color: "#FFFFFF",
    fontSize: "12px",
    fontWeight: "600",
    padding: "5px 12px",
    borderRadius: "16px",
  },
  menuArrow: {
    color: "#6E9952",
    fontWeight: "bold",
    fontSize: "18px",
  },
  menuDivider: {
    height: "1px",
    backgroundColor: "#F0F0F0",
    margin: "4px 0",
  },
  bottomNav: {
    backgroundColor: "#FFFFFF",
    borderTop: "1px solid #E5E5E5",
    height: "68px",
    display: "flex",
    justifyContent: "space-around",
    alignItems: "center",
    flexShrink: 0,
  },
  navBtn: {
    background: "transparent",
    border: "none",
    cursor: "pointer",
    padding: "8px",
  },
};
