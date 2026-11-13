// 어떤재료인가요? : 직접 입력
// catalog: 재료 사전 (자동완성). 사전에 있는 이름으로 넣어야 사진이 붙음
const NameField = ({ value, onChange, catalog = [] }) => (
  <div className="ingredient-form-card">
    <div className="ingredient-form-label">어떤재료인가요?</div>
    <input type="text" list="ingredient-names" value={value} onChange={(e) => onChange(e.target.value)} className="ingredient-form-name" />
    <datalist id="ingredient-names">
      {catalog.map((item) => <option key={item.name} value={item.name} />)}
    </datalist>
  </div>
);

export default NameField;
