import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router";
import RegisterHeader from "../components/Ingredient/Frame/RegisterHeader";
import NameField from "../components/Ingredient/Fields/NameField";
import EditQuantityField from "../components/Ingredient/Fields/EditQuantityField";
import StorageSelect from "../components/Ingredient/Fields/StorageSelect";
import ExpiryField from "../components/Ingredient/Fields/ExpiryField";
import SubmitButton from "../components/Ingredient/Frame/SubmitButton";
import EditBottomNav from "../components/Ingredient/Frame/EditBottomNav";
import { apiFetch } from "../utils/auth";
import { getTodayKey } from "../utils/fridgeUtils";
import { useIngredientCatalog } from "../utils/ingredientCatalog";
import "../styles/Ingredient.css";
import "../styles/IngredientEdit.css";

// /ingredient/edit/:id — DB(ingredients)의 내 재료를 불러와 고치고 저장 (로그인은 router 에서 확인)
export default function IngredientEdit() {
  const { id } = useParams();
  // 응답을 어느 id 것인지와 함께 보관 → 주소의 id 가 바뀌면 자동으로 "불러오는 중"
  const [loaded, setLoaded] = useState({ id: null, item: null, error: "" });

  useEffect(() => {
    let ignore = false;
    apiFetch(`/api/ingredients/${encodeURIComponent(id)}`)
      .then((item) => !ignore && setLoaded({ id, item, error: "" }))
      .catch((e) => !ignore && setLoaded({ id, item: null, error: e.message }));
    return () => { ignore = true; };
  }, [id]);

  if (loaded.id !== id) return <p className="ingredient-edit-status">재료를 불러오는 중...</p>;
  if (!loaded.item) {
    return <p className="ingredient-edit-status" role="alert">{loaded.error} <Link to="/fridge">냉장고로 돌아가기</Link></p>;
  }

  return <IngredientEditForm key={loaded.item.id} item={loaded.item} />;
}

// 편집 폼: 입력값과 저장(PATCH)만 여기서 관리하고, 입력 칸은 등록 화면과 같은 components/Ingredient 를 씀
function IngredientEditForm({ item }) {
  const navigate = useNavigate();
  const today = getTodayKey();
  const unit = item.unit;
  const catalog = useIngredientCatalog(); // 이름 자동완성용

  const [ingredient, setIngredient] = useState(item.name ?? "");
  const [quantity, setQuantity] = useState(item.quantity); // 입력칸 글자 그대로 (저장할 때 숫자로 검사)
  const [storage, setStorage] = useState(item.storage);
  const [expiryDate, setExpiryDate] = useState(item.expiry_date ?? "");
  const [saving, setSaving] = useState(false); // 저장 중 연타 방지

  async function handleSave() {
    const name = ingredient.trim();

    if (!name || !expiryDate) {
      alert("재료 이름과 소비기한을 입력해 주세요.");
      return;
    }

    const amount = Number(quantity);

    // 0 = 다 떨어짐 (지우지 않고 남겨 두면 메인 "다 떨어진 상품"에 표시)
    if (!Number.isFinite(amount) || amount < 0) {
      alert("수량은 0 이상의 숫자로 입력해 주세요.");
      return;
    }

    setSaving(true);
    try {
      await apiFetch(`/api/ingredients/${encodeURIComponent(item.id)}`, {
        method: "PATCH",
        body: { name, quantity: amount, unit, storage, expiryDate },
      });
      navigate("/fridge", { replace: true });
    } catch (e) {
      alert(`편집 내용을 저장하지 못했어요. ${e.message}`);
      setSaving(false);
    }
  }

  return (
    <div className="ingredient-form">
      {/* 420 * 915 고정 프레임 */}
      <div className="ingredient-form-frame is-edit">
        <RegisterHeader title="홈 | 냉장재료 편집" />

        <main className="ingredient-form-main">
          <NameField value={ingredient} onChange={setIngredient} catalog={catalog} />
          <div className="ingredient-form-row">
            <EditQuantityField value={quantity} unit={unit} onChange={setQuantity} />
            <StorageSelect value={storage} onChange={setStorage} />
          </div>
          {/* 이미 지난 기한도 그대로 두거나 고칠 수 있게 날짜 제한(min) 없음 */}
          <ExpiryField value={expiryDate} onChange={setExpiryDate} today={today} />
          <SubmitButton saving={saving} onClick={handleSave} label="편집 완료" />
        </main>

        <EditBottomNav />
      </div>
    </div>
  );
}
