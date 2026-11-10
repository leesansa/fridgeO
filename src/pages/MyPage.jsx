import React, { useRef, useState } from "react";
import { useNavigate } from "react-router";
import Header from "../components/Header";

const PROFILE_PHOTO_KEY = "fridgeO.profilePhoto";

export default function MyPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const navigate = useNavigate();
  const photoInputRef = useRef(null);
  const [profilePhoto, setProfilePhoto] = useState(
    () => localStorage.getItem(PROFILE_PHOTO_KEY) ?? "",
  );

  const handleProfilePhotoChange = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    event.target.value = "";

    const reader = new FileReader();
    reader.onload = () => {
      const image = new Image();
      image.onload = () => {
        const maxSize = 512;
        const scale = Math.min(
          1,
          maxSize / Math.max(image.width, image.height),
        );
        const canvas = document.createElement("canvas");
        canvas.width = Math.round(image.width * scale);
        canvas.height = Math.round(image.height * scale);
        canvas
          .getContext("2d")
          .drawImage(image, 0, 0, canvas.width, canvas.height);

        try {
          const photoData = canvas.toDataURL("image/jpeg", 0.82);
          localStorage.setItem(PROFILE_PHOTO_KEY, photoData);
          setProfilePhoto(photoData);
        } catch {
          alert("사진을 저장하지 못했어요. 다른 사진을 선택해 주세요.");
        }
      };
      image.onerror = () =>
        alert("사진 파일을 열 수 없어요. 다른 사진을 선택해 주세요.");
      image.src = reader.result;
    };
    reader.onerror = () => alert("사진을 읽지 못했어요. 다시 선택해 주세요.");
    reader.readAsDataURL(file);
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
              style={styles.profileAvatar}
              aria-label="프로필 사진 바꾸기"
              onClick={() => photoInputRef.current?.click()}
            >
              {profilePhoto ? (
                <img
                  src={profilePhoto}
                  alt="프로필 사진"
                  style={styles.profilePhotoImage}
                />
              ) : (
                "🍏"
              )}
              <span style={styles.profileCameraBadge} aria-hidden="true">
                <svg viewBox="0 0 24 24" style={styles.profileCameraIcon}>
                  <path d="M4 7h3l1.5-2h7L17 7h3v12H4z" />
                  <circle cx="12" cy="13" r="3.5" />
                </svg>
              </span>
            </button>
            <input
              ref={photoInputRef}
              type="file"
              accept="image/*"
              aria-label="프로필 사진 파일 선택"
              style={styles.hiddenPhotoInput}
              onChange={handleProfilePhotoChange}
            />
            <div>
              <div style={styles.profileName}>프레시요리사 님</div>
              <div style={styles.profileSub}>오늘도 냉장고를 비워볼까요?</div>
            </div>
          </div>

          {/* 북마크 / 팔로우 / 구독 통계 카드 */}
          <div
            style={{
              ...styles.card,
              display: "flex",
              justifyContent: "space-around",
              padding: "22px 12px",
            }}
          >
            <div style={styles.statItem} onClick={() => navigate("/bookmark")}>
              <div style={{ ...styles.statNum, color: "#4E7A36" }}>4개</div>
              <div style={styles.statLabel}>북마크</div>
            </div>
            <div style={styles.statDivider} />
            <div style={styles.statItem}>
              <div style={{ ...styles.statNum, color: "#4E7A36" }}>34</div>
              <div style={styles.statLabel}>팔로우</div>
            </div>
            <div style={styles.statDivider} />
            <div style={styles.statItem}>
              <div style={{ ...styles.statNum, color: "#C95B5B" }}>10</div>
              <div style={styles.statLabel}>구독</div>
            </div>
          </div>

          {/* 최근 본 레시피 / 정보 */}
          <div style={styles.card}>
            <div style={styles.sectionTitle}>최근 본 레시피 / 정보</div>
            <div style={{ display: "flex", gap: "14px" }}>
              <button
                type="button"
                style={styles.recipeMiniCard}
                aria-label="무생채 레시피 보기"
                onClick={() => navigate("/recipe/1")}
              >
                <div style={styles.recipeTitle}>　무생채</div>
                <div style={styles.recipeSub}>10분 완성</div>
              </button>
              <button
                type="button"
                style={styles.recipeMiniCard}
                aria-label="순두부찌개 레시피 보기"
                onClick={() => navigate("/recipe/2")}
              >
                <div style={styles.recipeTitle}>　순두부찌개</div>
                <div style={styles.recipeSub}>재료 100%일치</div>
              </button>
            </div>
          </div>

          {/* 하단 메뉴 리스트 */}
          <div style={{ ...styles.card, padding: "20px 24px" }}>
            <div style={styles.menuRow} onClick={() => navigate("/fridge")}>
              <span style={styles.menuText}>내 냉장고 관리</span>
              <span style={styles.urgentBadgeSmall}>임박 2개 &gt;</span>
            </div>
            <div style={styles.menuDivider} />
            <div style={styles.menuRow}>
              <span style={styles.menuText}>개인정보 관리</span>
              <span style={styles.menuArrow}>&gt;</span>
            </div>
            <div style={styles.menuDivider} />
            <div style={{ ...styles.menuRow, paddingBottom: 0 }}>
              <span style={styles.menuText}>알림 설정 | 동의/약관</span>
              <span style={styles.menuArrow}>&gt;</span>
            </div>
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
    padding: "20px 26px",
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
    borderRadius: "50%",
    backgroundColor: "#86A96F",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "36px",
    flexShrink: 0,
    padding: 0,
    border: "none",
    cursor: "pointer",
    overflow: "visible",
  },
  profilePhotoImage: {
    width: "100%",
    height: "100%",
    borderRadius: "50%",
    objectFit: "cover",
  },
  profileCameraBadge: {
    position: "absolute",
    right: "-5px",
    bottom: "-5px",
    display: "grid",
    placeItems: "center",
    width: "25px",
    height: "25px",
    border: "2px solid #FFFFFF",
    borderRadius: "50%",
    backgroundColor: "#4E7A36",
    color: "#FFFFFF",
    pointerEvents: "none",
  },
  profileCameraIcon: {
    width: "14px",
    height: "14px",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 2,
    strokeLinecap: "round",
    strokeLinejoin: "round",
  },
  hiddenPhotoInput: {
    display: "none",
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
  statItem: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    flex: 1,
    cursor: "pointer",
  },
  statNum: {
    fontSize: "18px",
    fontWeight: "700",
    marginBottom: "6px",
  },
  statLabel: {
    fontSize: "13px",
    color: "#555",
  },
  statDivider: {
    width: "1px",
    backgroundColor: "#EAEAEA",
  },
  sectionTitle: {
    fontSize: "14px",
    fontWeight: "700",
    color: "#333",
    marginBottom: "14px",
  },
  recipeMiniCard: {
    flex: 1,
    cursor: "pointer",
    backgroundColor: "#F3F4F3",
    borderRadius: "16px",
    padding: "16px 14px",
    border: "none",
    textAlign: "left",
    font: "inherit",
  },
  recipeTitle: {
    fontSize: "14px",
    fontWeight: "700",
    color: "#222",
    marginBottom: "6px",
  },
  recipeSub: {
    fontSize: "12px",
    color: "#666",
    paddingLeft: "20px",
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
