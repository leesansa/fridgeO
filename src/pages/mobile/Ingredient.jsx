import { useNavigate } from "react-router";
import RegisterHeader from "../../components/mobile/Ingredient/Frame/RegisterHeader";
import NameField from "../../components/mobile/Ingredient/Fields/NameField";
import QuantityCounter from "../../components/mobile/Ingredient/Fields/QuantityCounter";
import StorageSelect from "../../components/mobile/Ingredient/Fields/StorageSelect";
import ExpiryField from "../../components/mobile/Ingredient/Fields/ExpiryField";
import SubmitButton from "../../components/mobile/Ingredient/Frame/SubmitButton";
import { useIngredientForm } from "../../hooks/useIngredientForm";
import "../../styles/mobile/Ingredient.css";

// 냉장재료 등록: 입력값과 저장은 useIngredientForm(데스크탑과 공통), 각 입력 칸은 components/Ingredient
export default function FridgeRegister() {
  const navigate = useNavigate();
  const f = useIngredientForm();

  // 저장되면 냉장고로 돌아감
  const handleSubmit = async () => {
    if (await f.submit()) navigate("/fridge", { replace: true });
  };

  return (
    <div className="ingredient-form">
      {/* 420 * 915 고정 프레임 */}
      <div className="ingredient-form-frame">
        <RegisterHeader />

        <main className="ingredient-form-main">
          <NameField value={f.ingredient} onChange={f.setIngredient} catalog={f.catalog} />
          <div className="ingredient-form-row">
            <QuantityCounter value={f.quantity} onChange={f.setQuantity} />
            <StorageSelect value={f.storage} onChange={f.setStorage} />
          </div>
          <ExpiryField value={f.expiryDate} onChange={f.setPickedExpiry} today={f.today} min={f.today} quick />
          <SubmitButton saving={f.saving} onClick={handleSubmit} />
        </main>
      </div>
    </div>
  );
}
