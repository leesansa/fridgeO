import React, { useState } from "react";
import logo from "../assets/Logo_FridgeO.svg"; // 로고 이미지 경로

export default function MyPage() {
  const [searchQuery, setSearchQuery] = useState("");

  return (
    <div style={styles.pageWrapper}>
      {/* 420 * 915 고정 프레임 */}
      <div style={styles.mobileContainer}>
        {/* 상단 검색 헤더 */}
        <header style={styles.myPageHeader}>
          <span style={styles.backArrow}>&lt;</span>

          {/* 2. 이 부분을 아래와 같이 수정하세요 */}
          <div style={{ ...styles.logoCircle, overflow: "hidden" }}>
            <img
              src={logo} // 👈 따옴표 없이 위에서 import한 변수명인 logo를 중괄호 안에 그대로 넣습니다.
              alt="Logo"
              style={{
                width: "50px%",
                height: "auto",
                objectFit: "contain",
                transform: "scale(1.8)", // 👈 1.8배 강제 확대! (더 키우고 싶으면 2.0, 2.5 등으로 조절)
                transformOrigin: "center", // 중심을 기준으로 확대
              }}
            />
          </div>

          <div style={styles.searchBar}>
            <span
              style={{ color: "#999", marginRight: "8px", fontSize: "14px" }}
            >
              🔍
            </span>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="냉장고 안 재료를 검색해보세요"
              style={styles.searchInput}
            />
          </div>
        </header>

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
            <div style={styles.profileAvatar}>🍏</div>
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
            <div style={styles.statItem}>
              <div style={{ ...styles.statNum, color: "#4E7A36" }}>3개</div>
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
              <div style={styles.recipeMiniCard}>
                <div style={styles.recipeTitle}>🥗 사과 샐러드</div>
                <div style={styles.recipeSub}>10분 완성</div>
              </div>
              <div style={styles.recipeMiniCard}>
                <div style={styles.recipeTitle}>🍲 두부 된장찌개</div>
                <div style={styles.recipeSub}>재료 100%일치</div>
              </div>
            </div>
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
  myPageHeader: {
    padding: "24px 26px 10px 26px",
    display: "flex",
    alignItems: "center",
    gap: "12px",
  },
  backArrow: {
    color: "#6E9952",
    fontSize: "22px",
    fontWeight: "bold",
    cursor: "pointer",
    lineHeight: 1,
  },
  logoCircle: {
    width: "41px",
    height: "43px",
    borderRadius: "50%",

    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    color: "#fff",
    flexShrink: 0,
  },
  searchBar: {
    flex: 1,
    display: "flex",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    border: "1.5px solid #6E9952",
    borderRadius: "24px",
    padding: "8px 16px",
  },
  searchInput: {
    border: "none",
    outline: "none",
    width: "100%",
    fontSize: "13px",
    color: "#333",
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
    width: "72px",
    height: "72px",
    borderRadius: "50%",
    backgroundColor: "#86A96F",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "36px",
    flexShrink: 0,
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
    backgroundColor: "#F3F4F3",
    borderRadius: "16px",
    padding: "16px 14px",
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
