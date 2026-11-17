import { Link, useNavigate, useParams } from "react-router";
import IngredientFields from "../../components/desktop/ingredient/IngredientFields";
import IngredientPreview from "../../components/desktop/ingredient/IngredientPreview";
import { useIngredientEditForm } from "../../hooks/useIngredientEditForm";
import { useIngredient } from "../../queries/ingredients";
import "../../styles/desktop/ingredient.css";

// 데스크탑 재료 편집: 등록 화면과 같은 입력 칸·미리보기 + 바꾸기 전 값 비교
// 모바일보다 단위 바꾸기·"다 떨어졌어요"·삭제가 더 있음. 불러오기·저장은 모바일과 같은 useIngredient(queries)·useIngredientEditForm
export default function IngredientEdit() {
    const { id } = useParams();
    const { data: item, error, isPending: loading } = useIngredient(id);

    if (loading) return <div className="ding"><p className="ding-hint">재료를 불러오는 중...</p></div>;
    if (!item) {
        return <div className="ding"><p className="ding-hint" role="alert">{error?.message} <Link to="/fridge">냉장고로 돌아가기</Link></p></div>;
    }
    return <IngredientEditForm key={item.id} item={item} />;
}

function IngredientEditForm({ item }) {
    const navigate = useNavigate();
    const f = useIngredientEditForm(item);
    const name = f.ingredient.trim();

    // 바뀐 칸만 "전 → 후" 로 보여 줌
    const before = { name: item.name, quantity: `${item.quantity} ${item.unit}`, storage: item.storage, expiry: item.expiry_date ?? "기한 없음" };
    const after = { name, quantity: `${f.quantity} ${f.unit}`, storage: f.storage, expiry: f.expiryDate || "기한 없음" };
    const labels = { name: "이름", quantity: "수량", storage: "보관", expiry: "유통기한" };
    const changes = Object.keys(labels).filter((k) => String(before[k]) !== String(after[k]));

    const done = async (action) => {
        if (await action()) navigate("/fridge", { replace: true });
    };

    return (
        <div className="ding">
            <nav className="ding-crumbs" aria-label="현재 위치">
                <Link to="/fridge">냉장고</Link> › <span aria-current="page">{item.name} 편집</span>
            </nav>

            <div className="ding-layout">
                <form
                    className="ding-form"
                    onSubmit={(e) => {
                        e.preventDefault();
                        done(f.save);
                    }}
                >
                    <h1>재료 편집하기</h1>

                    <IngredientFields
                        name={f.ingredient} onName={f.setIngredient} catalog={f.catalog}
                        quantity={f.quantity} onQuantity={f.setQuantity} minQuantity={0} unit={f.unit} onUnit={f.setUnit}
                        quantityExtra={
                            <button type="button" className="ding-empty-btn" aria-pressed={Number(f.quantity) === 0 && f.quantity !== ""}
                                onClick={() => f.setQuantity(0)}>
                                다 떨어졌어요
                            </button>
                        }
                        storage={f.storage} onStorage={f.setStorage}
                        expiryDate={f.expiryDate} onExpiry={f.setExpiryDate} today={f.today}
                    />

                    <div className="ding-actions">
                        <button type="button" className="ding-btn" disabled={f.saving} onClick={() => navigate("/fridge")}>취소</button>
                        <button type="button" className="ding-btn danger" disabled={f.saving} onClick={() => done(f.remove)}>삭제</button>
                        <button type="submit" className="ding-btn primary" disabled={f.saving || changes.length === 0}>
                            {f.saving ? "저장 중..." : "편집 완료"}
                        </button>
                    </div>
                </form>

                <aside className="ding-side">
                    <IngredientPreview name={name} quantity={f.quantity} unit={f.unit} storage={f.storage} expiryDate={f.expiryDate} today={f.today} />

                    <section className="ding-card" aria-labelledby="ding-changes-title">
                        <h2 id="ding-changes-title">바뀌는 내용 <span>{changes.length}</span></h2>
                        {changes.length === 0 ? (
                            <p className="ding-hint">아직 바꾼 내용이 없어요.</p>
                        ) : (
                            <dl className="ding-changes">
                                {changes.map((k) => (
                                    <div key={k}>
                                        <dt>{labels[k]}</dt>
                                        <dd><s>{before[k]}</s> → <strong>{after[k] || "(비어 있음)"}</strong></dd>
                                    </div>
                                ))}
                            </dl>
                        )}
                    </section>
                </aside>
            </div>
        </div>
    );
}
