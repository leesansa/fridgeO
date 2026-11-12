// 수량: − / + 로 1개 이상 조절
const QuantityCounter = ({ value, onChange }) => (
  <div className="ingredient-add-card is-quantity">
    <div className="ingredient-add-label">수량</div>
    <div className="ingredient-add-counter">
      <button className="ingredient-add-counter-btn" onClick={() => onChange(Math.max(1, value - 1))}>
        −
      </button>
      <span className="ingredient-add-counter-value">{value}개</span>
      <button className="ingredient-add-counter-btn" onClick={() => onChange(value + 1)}>
        +
      </button>
    </div>
  </div>
);

export default QuantityCounter;
