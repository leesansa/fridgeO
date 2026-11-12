const METHODS = ["냉장", "냉동", "실온"]; // DB ingredients.storage 에 들어갈 수 있는 값

// 보관 방법: 냉장 · 냉동 · 실온 중 하나
const StorageSelect = ({ value, onChange }) => (
  <div className="ingredient-add-card is-storage">
    <div className="ingredient-add-label">보관 방법</div>
    <div className="ingredient-add-storage">
      {METHODS.map((method) => (
        <button
          key={method}
          onClick={() => onChange(method)}
          className={`ingredient-add-storage-btn${value === method ? " is-selected" : ""}`}
        >
          {method}
        </button>
      ))}
    </div>
  </div>
);

export default StorageSelect;
