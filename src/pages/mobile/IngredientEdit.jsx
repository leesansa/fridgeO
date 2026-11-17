import { Link, useNavigate, useParams } from "react-router";
import RegisterHeader from "../../components/mobile/Ingredient/Frame/RegisterHeader";
import NameField from "../../components/mobile/Ingredient/Fields/NameField";
import EditQuantityField from "../../components/mobile/Ingredient/Fields/EditQuantityField";
import StorageSelect from "../../components/mobile/Ingredient/Fields/StorageSelect";
import ExpiryField from "../../components/mobile/Ingredient/Fields/ExpiryField";
import SubmitButton from "../../components/mobile/Ingredient/Frame/SubmitButton";
import { useEditableIngredient, useIngredientEditForm } from "../../hooks/useIngredientEditForm";
import "../../styles/mobile/Ingredient.css";
import "../../styles/mobile/IngredientEdit.css";

// /ingredient/edit/:id — DB(ingredients)의 내 재료를 불러와 고치고 저장 (로그인은 router 에서 확인)
export default function IngredientEdit() {
  const { id } = useParams();
  const { loading, item, error } = useEditableIngredient(id);

  if (loading) return <p className="ingredient-edit-status">재료를 불러오는 중...</p>;
  if (!item) {
    return <p className="ingredient-edit-status" role="alert">{error} <Link to="/fridge">냉장고로 돌아가기</Link></p>;
  }

  return <IngredientEditForm key={item.id} item={item} />;
}

// 편집 폼: 입력값과 저장(PATCH)은 useIngredientEditForm(데스크탑과 공통), 입력 칸은 등록 화면과 같은 components/Ingredient 를 씀
function IngredientEditForm({ item }) {
  const navigate = useNavigate();
  const f = useIngredientEditForm(item);

  const handleSave = async () => {
    if (await f.save()) navigate("/fridge", { replace: true });
  };

  return (
    <div className="ingredient-form">
      {/* 420 * 915 고정 프레임 */}
      <div className="ingredient-form-frame">
        <RegisterHeader title="홈 | 냉장재료 편집" />

        <main className="ingredient-form-main">
          <NameField value={f.ingredient} onChange={f.setIngredient} catalog={f.catalog} />
          <div className="ingredient-form-row">
            <EditQuantityField value={f.quantity} unit={f.unit} onChange={f.setQuantity} />
            <StorageSelect value={f.storage} onChange={f.setStorage} />
          </div>
          {/* 이미 지난 기한도 그대로 두거나 고칠 수 있게 날짜 제한(min) 없음 */}
          <ExpiryField value={f.expiryDate} onChange={f.setExpiryDate} today={f.today} />
          <SubmitButton saving={f.saving} onClick={handleSave} label="편집 완료" />
        </main>
      </div>
    </div>
  );
}
