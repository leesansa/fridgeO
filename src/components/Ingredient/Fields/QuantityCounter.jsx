// 수량: − / + 로 1개 이상 조절
const QuantityCounter = ({ value, onChange }) => (
  <div className="ingredient-form-card is-quantity">
    <div className="ingredient-form-label">수량</div>
    <div className="ingredient-form-counter">
      <button className="ingredient-form-counter-btn" onClick={() => onChange(Math.max(1, value - 1))}>
        −
      </button>
      <span className="ingredient-form-counter-value">{value}개</span>
      <button className="ingredient-form-counter-btn" onClick={() => onChange(value + 1)}>
        +
      </button>
    </div>
  </div>
);

export default QuantityCounter;
