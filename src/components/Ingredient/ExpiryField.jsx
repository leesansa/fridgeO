import { useRef } from "react";
import { getExpiryBadge } from "../../utils/fridgeUtils";

// 유통기한: 날짜 글자나 달력 아이콘을 누르면 브라우저 달력 창. 오른쪽 배지는 남은 기한 (5일 이하면 빨강)
// min: 고를 수 있는 가장 이른 날짜 (등록은 오늘부터, 편집은 이미 지난 날짜도 그대로 두려고 제한 없음)
const ExpiryField = ({ value, onChange, today, min }) => {
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
    <div className="ingredient-form-card is-expiry">
      <div className="ingredient-form-label">유통기한</div>
      <div className="ingredient-form-expiry">
        <button type="button" className="ingredient-form-expiry-text" onClick={openPicker}>
          {value ? `${value} 까지` : "날짜를 골라 주세요"}
        </button>
        <button type="button" className="ingredient-form-calendar" aria-label="유통기한 달력 열기" onClick={openPicker}>
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <rect x="3" y="5" width="18" height="16" rx="2" />
            <path d="M16 3v4M8 3v4M3 10h18" />
          </svg>
        </button>
        {/* 실제 날짜 값. 화면에는 숨기고 위 버튼이 showPicker() 로 달력을 띄움 (달력이 이 근처에 뜨도록 오른쪽에 둠) */}
        {/* min 이 없으면 React 가 속성을 빼서 날짜 제한 없음 */}
        <input
          ref={dateRef}
          type="date"
          value={value}
          min={min}
          onChange={(e) => onChange(e.target.value)}
          aria-label="유통기한 선택"
          tabIndex={-1}
          className="ingredient-form-date-input"
        />
        <span className={`ingredient-form-badge${badge.className === "is-urgent" ? " is-urgent" : ""}`}>{badge.label}</span>
      </div>
    </div>
  );
};

export default ExpiryField;
