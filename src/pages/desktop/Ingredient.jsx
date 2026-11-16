import { useState } from "react";
import { Link, useNavigate } from "react-router";
import IngredientFields from "../../components/desktop/ingredient/IngredientFields";
import IngredientPreview from "../../components/desktop/ingredient/IngredientPreview";
import { useIngredientForm } from "../../utils/useIngredientForm";
import "../../styles/desktop/ingredient.css";

// 데스크탑 냉장재료 등록: 왼쪽 입력 | 오른쪽 냉장고에 들어갈 모습 미리보기 + 방금 넣은 재료
// 모바일보다 단위 고르기·직접 수량 입력·기한 빠른 선택·"저장하고 계속 추가"가 더 있음. 저장은 모바일과 같은 useIngredientForm
export default function Ingredient() {
    const navigate = useNavigate();
    const f = useIngredientForm();
    const [added, setAdded] = useState([]); // 이 화면에서 "계속 추가"로 넣은 재료 이름
    const name = f.ingredient.trim();

    const submit = async (keepGoing) => {
        if (!(await f.submit())) return;
        if (!keepGoing) {
            navigate("/fridge", { replace: true });
            return;
        }
        setAdded((list) => [name, ...list]);
        f.reset();
        document.getElementById("ding-name")?.focus(); // 바로 다음 재료 이름을 칠 수 있게
    };

    return (
        <div className="ding">
            <nav className="ding-crumbs" aria-label="현재 위치">
                <Link to="/fridge">냉장고</Link> › <span aria-current="page">재료 추가</span>
            </nav>

            <div className="ding-layout">
                <form
                    className="ding-form"
                    onSubmit={(e) => {
                        e.preventDefault();
                        submit(false);
                    }}
                >
                    <h1>냉장고에 재료 추가하기</h1>

                    <IngredientFields
                        name={f.ingredient} onName={f.setIngredient} catalog={f.catalog}
                        nameHint={!name ? "재료 이름을 입력하면 기본 유통기한을 알려 드려요"
                            : f.known ? `재료 사전 기준 보통 ${f.shelfLife}일 보관해요`
                            : `사전에 없는 재료예요. 유통기한을 오늘부터 ${f.shelfLife}일로 잡아 둘게요`}
                        quantity={f.quantity} onQuantity={f.setQuantity} minQuantity={1} unit={f.unit} onUnit={f.setUnit}
                        storage={f.storage} onStorage={f.setStorage}
                        expiryDate={f.expiryDate} onExpiry={f.setPickedExpiry} today={f.today} minDate={f.today} allowNoExpiry
                    />

                    <div className="ding-actions">
                        <button type="button" className="ding-btn" disabled={f.saving} onClick={() => navigate("/fridge")}>취소</button>
                        <button type="button" className="ding-btn" disabled={f.saving} onClick={() => submit(true)}>저장하고 계속 추가</button>
                        <button type="submit" className="ding-btn primary" disabled={f.saving}>{f.saving ? "저장 중..." : "추가 완료"}</button>
                    </div>
                </form>

                <aside className="ding-side">
                    <IngredientPreview name={name} quantity={f.quantity} unit={f.unit} storage={f.storage} expiryDate={f.expiryDate} today={f.today} />

                    <section className="ding-card" aria-labelledby="ding-added-title">
                        <h2 id="ding-added-title">방금 넣은 재료 <span>{added.length}</span></h2>
                        {added.length === 0 ? (
                            <p className="ding-hint">"저장하고 계속 추가"로 여러 재료를 한 번에 넣을 수 있어요.</p>
                        ) : (
                            <ul className="ding-added" role="status">
                                {added.map((n, i) => <li key={`${n}-${added.length - i}`}>{n}</li>)}
                            </ul>
                        )}
                        {added.length > 0 && <Link to="/fridge" className="ding-link">냉장고에서 확인하기 ›</Link>}
                    </section>
                </aside>
            </div>
        </div>
    );
}
