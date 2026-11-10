import React, { useState } from "react";
import { Link } from "react-router";
import backIcon from "../assets/lucide_chevron_left_icon.png";

export default function FridgeRegister() {
  const [ingredient, setIngredient] = useState("🍎사과");
  const [selectedTag, setSelectedTag] = useState("사과");
  const [quantity, setQuantity] = useState(3);
  const [storage, setStorage] = useState("냉장");
  const [expiryDate, setExpiryDate] = useState("2026. 11. 10 까지");

  const tags = [
    { name: "사과", emoji: "🍎" },
    { name: "계란", emoji: "🥚" },
    { name: "대파", emoji: "🌱" },
    { name: "우유", emoji: "🥛" },
  ];

  const handleTagClick = (tag) => {
    setSelectedTag(tag.name);
    setIngredient(`${tag.emoji}${tag.name}`);
  };

  return (
    <div style={styles.pageWrapper}>
      {/* 420 * 915 고정 프레임 */}
      <div style={styles.mobileContainer}>
        {/* 상단 헤더 */}
        <header style={styles.header}>
          <Link to="/" className="fridge-back" aria-label="홈으로">
            <img src={backIcon} alt="" />
          </Link>
          <span style={styles.headerTitle}>홈 | 냉장재료 등록</span>
        </header>

        {/* 메인 컨텐츠 영역 */}
        <main style={styles.mainContent}>
          {/* Frame 36: 어떤재료인가요? */}
          <div style={styles.card}>
            <div style={styles.cardLabel}>어떤재료인가요?</div>
            <input
              type="text"
              value={ingredient}
              onChange={(e) => setIngredient(e.target.value)}
              style={styles.ingredientInput}
            />
            <div style={styles.tagContainer}>
              {tags.map((t) => (
                <button
                  key={t.name}
                  onClick={() => handleTagClick(t)}
                  style={{
                    ...styles.tagPill,
                    backgroundColor:
                      selectedTag === t.name ? "#7FA766" : "#EFEFEF",
                    color: selectedTag === t.name ? "#FFFFFF" : "#444444",
                  }}
                >
                  {t.name}
                </button>
              ))}
            </div>
          </div>

          {/* Frame 37 & 38: 수량 & 보관 방법 */}
          <div style={styles.rowCards}>
            {/* 수량 */}
            <div style={{ ...styles.card, flex: 1, padding: "20px 18px" }}>
              <div style={styles.cardLabel}>수량</div>
              <div style={styles.counterBox}>
                <button
                  style={styles.counterBtn}
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                >
                  −
                </button>
                <span style={styles.counterValue}>{quantity}개</span>
                <button
                  style={styles.counterBtn}
                  onClick={() => setQuantity(quantity + 1)}
                >
                  +
                </button>
              </div>
            </div>

            {/* 보관 방법 */}
            <div style={{ ...styles.card, flex: 1.15, padding: "20px 18px" }}>
              <div style={styles.cardLabel}>보관 방법</div>
              <div style={styles.storageBox}>
                {["냉장", "냉동", "실온"].map((method) => (
                  <button
                    key={method}
                    onClick={() => setStorage(method)}
                    style={{
                      ...styles.storageBtn,
                      backgroundColor:
                        storage === method ? "#7FA766" : "transparent",
                      color: storage === method ? "#FFFFFF" : "#444444",
                    }}
                  >
                    {method}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Frame 39: 유통기한 */}
          <div
            style={{ ...styles.card, width: "100%", boxSizing: "border-box" }}
          >
            <div style={styles.cardLabel}>유통기한</div>
            <div style={styles.expiryRow}>
              <input
                type="text"
                value={expiryDate}
                onChange={(e) => setExpiryDate(e.target.value)}
                style={styles.expiryInput}
              />
              <span style={styles.urgentBadge}>D-3 임박</span>
            </div>
          </div>

          {/* Frame 41: 추가완료 버튼 */}
          <div style={styles.submitWrapper}>
            <button
              style={styles.submitBtn}
              onClick={() =>
                alert(`${ingredient} ${quantity}개 (${storage}) 등록 완료!`)
              }
            >
              추가완료
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
    paddingBottom: "68px",
    backgroundColor: "#F3F4F3",
    display: "flex",
    flexDirection: "column",
    justifyContent: "space-between",
    boxShadow: "0 10px 30px rgba(0,0,0,0.12)",
    overflow: "hidden",
    boxSizing: "border-box",
  },
  header: {
    backgroundColor: "#FFFFFF",
    padding: "22px 24px",
    display: "flex",
    alignItems: "center",
    gap: "12px",
    borderTopLeftRadius: "20px",
    borderTopRightRadius: "20px",
  },
  headerTitle: {
    fontSize: "16px",
    fontWeight: "700",
    color: "#222222",
  },
  mainContent: {
    flex: 1,
    padding: "28px 26px",
    display: "flex",
    flexDirection: "column",
    gap: "22px",
    boxSizing: "border-box",
  },
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: "20px",
    padding: "22px 24px",
    boxShadow: "0 2px 8px rgba(0,0,0,0.02)",
  },
  cardLabel: {
    fontSize: "13.5px",
    fontWeight: "600",
    color: "#444444",
    marginBottom: "12px",
  },
  ingredientInput: {
    width: "100%",
    border: "none",
    borderBottom: "1px solid #EAEAEA",
    fontSize: "18px",
    fontWeight: "600",
    padding: "8px 0 12px 0",
    marginBottom: "14px",
    outline: "none",
    color: "#222",
  },
  tagContainer: {
    display: "flex",
    gap: "8px",
  },
  tagPill: {
    border: "none",
    borderRadius: "16px",
    padding: "6px 14px",
    fontSize: "13px",
    fontWeight: "600",
    cursor: "pointer",
  },
  rowCards: {
    display: "flex",
    gap: "16px",
  },
  counterBox: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#F2F3F2",
    borderRadius: "18px",
    padding: "8px 14px",
    marginTop: "8px",
  },
  counterBtn: {
    border: "none",
    background: "transparent",
    color: "#6E9952",
    fontSize: "18px",
    fontWeight: "bold",
    cursor: "pointer",
  },
  counterValue: {
    fontSize: "16px",
    fontWeight: "600",
    color: "#222",
  },
  storageBox: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#F2F3F2",
    borderRadius: "18px",
    padding: "5px",
    marginTop: "8px",
  },
  storageBtn: {
    border: "none",
    borderRadius: "14px",
    padding: "6px 11px",
    fontSize: "13px",
    fontWeight: "600",
    cursor: "pointer",
    transition: "0.2s",
  },
  expiryRow: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: "6px",
  },
  expiryInput: {
    fontSize: "17px",
    fontWeight: "700",
    color: "#111",
    border: "none",
    outline: "none",
    width: "65%",
  },
  urgentBadge: {
    backgroundColor: "#C85A5A",
    color: "#FFFFFF",
    fontSize: "13px",
    fontWeight: "600",
    padding: "7px 16px",
    borderRadius: "18px",
  },
  submitWrapper: {
    marginTop: "auto",
    paddingBottom: "0",
    display: "flex",
    justifyContent: "center",
  },
  submitBtn: {
    width: "94%",
    backgroundColor: "#4E7A36",
    color: "#FFFFFF",
    border: "none",
    borderRadius: "28px",
    padding: "18px 0",
    fontSize: "19px",
    fontWeight: "700",
    cursor: "pointer",
  },
};
