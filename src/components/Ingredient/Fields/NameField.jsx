import { useState } from "react";

// 자주 넣는 재료 바로 고르기. 재료 사전(ingredient_catalog)에 있는 이름과 맞춤 ("계란"은 사전에서 "달걀")
const TAGS = ["사과", "달걀", "대파", "우유"];

// 어떤재료인가요? : 직접 입력하거나 태그를 눌러 이름 채우기
const NameField = ({ value, onChange }) => {
  const [selectedTag, setSelectedTag] = useState(value); // 마지막으로 누른 태그 (직접 입력해도 강조는 유지)

  const pick = (name) => {
    setSelectedTag(name);
    onChange(name);
  };

  return (
    <div className="ingredient-form-card">
      <div className="ingredient-form-label">어떤재료인가요?</div>
      <input type="text" value={value} onChange={(e) => onChange(e.target.value)} className="ingredient-form-name" />
      <div className="ingredient-form-tags">
        {TAGS.map((name) => (
          <button key={name} onClick={() => pick(name)} className={`ingredient-form-tag${selectedTag === name ? " is-selected" : ""}`}>
            {name}
          </button>
        ))}
      </div>
    </div>
  );
};

export default NameField;
