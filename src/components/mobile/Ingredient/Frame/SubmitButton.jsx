// 추가완료 / 편집 완료: 저장 중에는 잠가서 두 번 눌러도 두 번 저장되지 않게
const SubmitButton = ({ saving, onClick, label = "추가완료" }) => (
  <div className="ingredient-form-submit-wrap">
    <button type="button" className="ingredient-form-submit" disabled={saving} onClick={onClick}>
      {saving ? "저장 중..." : label}
    </button>
  </div>
);

export default SubmitButton;
