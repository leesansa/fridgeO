import { useRef } from "react";
import { getExpiryBadge } from "../../utils/fridgeUtils";

// 유통기한: 날짜 글자나 달력 아이콘을 누르면 브라우저 달력 창. 오른쪽 배지는 남은 기한 (5일 이하면 빨강)
const ExpiryField = ({ value, onChange, today }) => {
  const badge = getExpiryBadge(value, today);

  // 숨겨 둔 날짜 칸의 달력 창 열기. showPicker 가 없는 옛 브라우저는 날짜 칸에 포커스만 줌
  const dateRef = useRef(null);
  const openPicker = () => {
    try {
      dateRef.current.showPicker();
    } catch {
      dateRef.current.focus();
    }
  };

  return (
    <div className="ingredient-add-card is-expiry">
      <div className="ingredient-add-label">유통기한</div>
      <div className="ingredient-add-expiry">
        <button type="button" className="ingredient-add-expiry-text" onClick={openPicker}>
          {value ? `${value} 까지` : "날짜를 골라 주세요"}
        </button>
        <button type="button" className="ingredient-add-calendar" aria-label="유통기한 달력 열기" onClick={openPicker}>
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <rect x="3" y="5" width="18" height="16" rx="2" />
            <path d="M16 3v4M8 3v4M3 10h18" />
          </svg>
        </button>
        {/* 실제 날짜 값. 화면에는 숨기고 위 버튼이 showPicker() 로 달력을 띄움 (달력이 이 근처에 뜨도록 오른쪽에 둠) */}
        <input
          ref={dateRef}
          type="date"
          value={value}
          min={today}
          onChange={(e) => onChange(e.target.value)}
          aria-label="유통기한 선택"
          tabIndex={-1}
          className="ingredient-add-date-input"
        />
        <span className={`ingredient-add-badge${badge.className === "is-urgent" ? " is-urgent" : ""}`}>{badge.label}</span>
      </div>
    </div>
  );
};

export default ExpiryField;
