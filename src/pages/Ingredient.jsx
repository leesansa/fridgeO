import { useState } from "react";
import { useNavigate } from "react-router";
import RegisterHeader from "../components/Ingredient/Frame/RegisterHeader";
import NameField from "../components/Ingredient/Fields/NameField";
import QuantityCounter from "../components/Ingredient/Fields/QuantityCounter";
import StorageSelect from "../components/Ingredient/Fields/StorageSelect";
import ExpiryField from "../components/Ingredient/Fields/ExpiryField";
import SubmitButton from "../components/Ingredient/Frame/SubmitButton";
import { apiFetch } from "../utils/auth";
import { getTodayKey } from "../utils/fridgeUtils";
import "../styles/Ingredient.css";

// "2026-11-11" + 7일 → "2026-11-18" (UTC 로 계산해 시간대 영향 없음)
const addDays = (dateKey, days) => {
  const date = new Date(`${dateKey}T00:00:00Z`);
  date.setUTCDate(date.getUTCDate() + days);
  return date.toISOString().slice(0, 10);
};

// 냉장재료 등록: 입력값과 저장만 여기서 관리하고, 각 입력 칸은 components/Ingredient
export default function FridgeRegister() {
  const navigate = useNavigate();
  const today = getTodayKey();
  const [ingredient, setIngredient] = useState("사과");
  const [quantity, setQuantity] = useState(3);
  const [storage, setStorage] = useState("냉장");
  const [expiryDate, setExpiryDate] = useState(() => addDays(today, 7));
  const [saving, setSaving] = useState(false); // 저장 중 두 번 눌러 두 개 생기지 않게

  // DB(ingredients)에 저장하고 냉장고로 돌아감
  const handleSubmit = async () => {
    const name = ingredient.trim();
    if (!name) {
      alert("재료 이름을 입력해 주세요.");
      return;
    }
    setSaving(true);
    try {
      await apiFetch("/api/ingredients", {
        method: "POST",
        body: { name, quantity, unit: "개", storage, expiryDate: expiryDate || null },
      });
      navigate("/fridge", { replace: true });
    } catch (e) {
      alert(`재료를 추가하지 못했어요. ${e.message}`);
      setSaving(false);
    }
  };

  return (
    <div className="ingredient-form">
      {/* 420 * 915 고정 프레임 */}
      <div className="ingredient-form-frame">
        <RegisterHeader />

        <main className="ingredient-form-main">
          <NameField value={ingredient} onChange={setIngredient} />
          <div className="ingredient-form-row">
            <QuantityCounter value={quantity} onChange={setQuantity} />
            <StorageSelect value={storage} onChange={setStorage} />
          </div>
          <ExpiryField value={expiryDate} onChange={setExpiryDate} today={today} min={today} />
          <SubmitButton saving={saving} onClick={handleSubmit} />
        </main>
      </div>
    </div>
  );
}
