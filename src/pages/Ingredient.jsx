import { useRef, useState } from "react";
import { Link, useNavigate } from "react-router";
import backIcon from "../assets/lucide_chevron_left_icon.png";
import { apiFetch } from "../utils/auth";
import { getExpiryBadge, getTodayKey } from "../utils/fridgeUtils";

// "2026-11-11" + 7일 → "2026-11-18" (UTC 로 계산해 시간대 영향 없음)
const addDays = (dateKey, days) => {
  const date = new Date(`${dateKey}T00:00:00Z`);
  date.setUTCDate(date.getUTCDate() + days);
  return date.toISOString().slice(0, 10);
};

export default function FridgeRegister() {
  const navigate = useNavigate();
  const today = getTodayKey();
  const [ingredient, setIngredient] = useState("사과");
  const [selectedTag, setSelectedTag] = useState("사과");
  const [quantity, setQuantity] = useState(3);
  const [storage, setStorage] = useState("냉장");
  const [expiryDate, setExpiryDate] = useState(() => addDays(today, 7));
  const [saving, setSaving] = useState(false); // 저장 중 두 번 눌러 두 개 생기지 않게
  const badge = getExpiryBadge(expiryDate, today);

  // 숨겨 둔 날짜 칸의 달력 창 열기. showPicker 가 없는 옛 브라우저는 날짜 칸에 포커스만 줌
  const dateRef = useRef(null);
  const openPicker = () => {
    try {
      dateRef.current.showPicker();
    } catch {
      dateRef.current.focus();
    }
  };

  // DB(ingredients)에 저장하고 냉장고로 돌아감
  const handleSubmit = async () => {
    const name = ingredient.trim();
    if (!name) {
      alert("재료 이름을 입력해 주세요.");
      return;
    }
    setSaving(true);
    try {
      await apiFetch("/api/ingredients", {
        method: "POST",
        body: { name, quantity, unit: "개", storage, expiryDate: expiryDate || null },
      });
      navigate("/fridge", { replace: true });
    } catch (e) {
      alert(`재료를 추가하지 못했어요. ${e.message}`);
      setSaving(false);
    }
  };

  // 재료 사전(ingredient_catalog)에 있는 이름과 맞춤 ("계란"은 사전에서 "달걀")
  const tags = [
    { name: "사과" },
    { name: "달걀" },
    { name: "대파" },
    { name: "우유" },
  ];

  const handleTagClick = (tag) => {
    setSelectedTag(tag.name);
    setIngredient(tag.name);
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
              {/* 날짜 글자와 달력 아이콘 모두 누르면 브라우저 달력 창이 열림 */}
              <button type="button" style={styles.expiryInput} onClick={openPicker}>
                {expiryDate ? `${expiryDate} 까지` : "날짜를 골라 주세요"}
              </button>
              <button type="button" style={styles.calendarButton} aria-label="유통기한 달력 열기" onClick={openPicker}>
                <svg viewBox="0 0 24 24" aria-hidden="true" style={styles.calendarButtonSvg}>
                  <rect x="3" y="5" width="18" height="16" rx="2" />
                  <path d="M16 3v4M8 3v4M3 10h18" />
                </svg>
              </button>
              {/* 실제 날짜 값. 화면에는 숨기고 위 버튼이 showPicker() 로 달력을 띄움 (달력이 이 근처에 뜨도록 오른쪽에 둠) */}
              <input
                ref={dateRef}
                type="date"
                value={expiryDate}
                min={today}
                onChange={(e) => setExpiryDate(e.target.value)}
                aria-label="유통기한 선택"
                tabIndex={-1}
                style={styles.datePickerInput}
              />
              <span
                style={{
                  ...styles.urgentBadge,
                  backgroundColor: badge.className === "is-urgent" ? "#C85A5A" : "#99AB6E",
                }}
              >
                {badge.label}
              </span>
            </div>
          </div>

          {/* Frame 41: 추가완료 버튼 */}
          <div style={styles.submitWrapper}>
            <button
              type="button"
              style={{ ...styles.submitBtn, opacity: saving ? 0.6 : 1 }}
              disabled={saving}
              onClick={handleSubmit}
            >
              {saving ? "저장 중..." : "추가완료"}
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
    position: "relative", // 숨긴 날짜 칸의 기준 (달력 창이 이 줄 근처에 뜸)
    display: "flex",
    alignItems: "center",
    gap: "8px",
    marginTop: "6px",
  },
  expiryInput: {
    fontSize: "17px",
    fontWeight: "700",
    color: "#111",
    border: "none",
    width: "0",
    flex: 1,
    minWidth: 0,
    padding: 0,
    background: "transparent",
    fontFamily: "inherit",
    textAlign: "left",
    cursor: "pointer",
  },
  calendarButton: {
    display: "grid",
    placeItems: "center",
    width: "34px",
    height: "34px",
    flexShrink: 0,
    padding: 0,
    border: "none",
    borderRadius: "8px",
    background: "transparent",
    color: "#6E9952",
    cursor: "pointer",
  },
  // 화면에서는 숨기되 렌더링은 유지 (display: none 이면 showPicker 가 동작하지 않음)
  datePickerInput: {
    position: "absolute",
    right: 0,
    bottom: 0,
    width: "1px",
    height: "1px",
    padding: 0,
    border: 0,
    opacity: 0,
    pointerEvents: "none",
  },
  calendarButtonSvg: {
    width: "22px",
    height: "22px",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 2,
    strokeLinecap: "round",
    strokeLinejoin: "round",
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
