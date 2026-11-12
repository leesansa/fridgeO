// 편집 화면 수량: 직접 입력(소수 가능)하거나 − / + 로 조절. 0 = 다 떨어짐 (지우지 않고 남겨 두면 메인 "다 떨어진 상품"에 표시)
// 값은 입력칸 글자 그대로(문자열) 들고 있다가 저장할 때 숫자로 검사
const EditQuantityField = ({ value, unit, onChange }) => (
  <div className="ingredient-form-card is-quantity">
    <div className="ingredient-form-label">수량</div>
    <div className="ingredient-form-counter">
      <button
        type="button"
        className="ingredient-form-counter-btn"
        aria-label="수량 줄이기"
        onClick={() => onChange(String(Math.max(0, Number(value) - 1)))}
      >
        −
      </button>
      <input
        type="number"
        inputMode="decimal"
        step="any"
        aria-label="수량"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="ingredient-edit-quantity"
      />
      <span>{unit}</span>
      <button
        type="button"
        className="ingredient-form-counter-btn"
        aria-label="수량 늘리기"
        onClick={() => onChange(String(Number(value) + 1))}
      >
        +
      </button>
    </div>
  </div>
);

export default EditQuantityField;
