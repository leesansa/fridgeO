// 추가완료: 저장 중에는 잠가서 두 번 눌러도 두 개 생기지 않게
const SubmitButton = ({ saving, onClick }) => (
  <div className="ingredient-add-submit-wrap">
    <button type="button" className="ingredient-add-submit" disabled={saving} onClick={onClick}>
      {saving ? "저장 중..." : "추가완료"}
    </button>
  </div>
);

export default SubmitButton;
