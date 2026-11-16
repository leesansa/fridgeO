import { addDays } from "../../../utils/useIngredientForm";
import { getExpiryBadge } from "../../../utils/fridgeUtils";

const STORAGES = [
    ["냉장", "0~5℃, 채소·유제품·반찬"],
    ["냉동", "-18℃ 이하, 고기·생선·만두"],
    ["실온", "그늘진 곳, 감자·양파·조미료"],
];
const UNITS = ["개", "g", "kg", "ml", "L", "팩", "봉", "모", "단", "통", "병"];
const QUICK_DAYS = [3, 7, 14, 30];

// 데스크탑 재료 등록·편집 공통 입력 칸: 이름(자동완성) · 수량+단위 · 보관 장소 · 유통기한(빠른 선택). 스타일은 styles/desktop/ingredient.css
// minQuantity: 등록 1, 편집 0(다 떨어짐) / minDate: 등록은 오늘부터, 편집은 지난 날짜도 그대로 둘 수 있게 없음
// allowNoExpiry: "기한 없음" 버튼 (편집은 기한이 꼭 있어야 해서 없음) / quantityExtra: 수량 옆 추가 버튼
const IngredientFields = ({
    name, onName, catalog, nameHint,
    quantity, onQuantity, minQuantity, unit, onUnit, quantityExtra,
    storage, onStorage,
    expiryDate, onExpiry, today, minDate, allowNoExpiry,
}) => {
    const badge = getExpiryBadge(expiryDate, today);
    // 단위가 목록에 없으면(예전에 다른 단위로 저장) 그 단위도 고를 수 있게
    const units = UNITS.includes(unit) ? UNITS : [unit, ...UNITS];

    return (
        <>
            <div className="ding-field">
                <label htmlFor="ding-name" className="ding-label">어떤 재료인가요?</label>
                <input id="ding-name" list="ding-names" value={name} maxLength={30} autoComplete="off"
                    onChange={(e) => onName(e.target.value)} placeholder="예: 우유" />
                <datalist id="ding-names">
                    {catalog.map((item) => <option key={item.name} value={item.name} />)}
                </datalist>
                {nameHint && <p className="ding-hint">{nameHint}</p>}
            </div>

            <div className="ding-field">
                <span className="ding-label" id="ding-qty-label">수량</span>
                <div className="ding-counter" role="group" aria-labelledby="ding-qty-label">
                    <button type="button" aria-label="수량 줄이기" onClick={() => onQuantity(Math.max(minQuantity, Number(quantity || 0) - 1))}>−</button>
                    <input type="number" min={minQuantity} step="any" aria-label="수량" value={quantity}
                        onChange={(e) => onQuantity(e.target.value === "" ? "" : Number(e.target.value))} />
                    <button type="button" aria-label="수량 늘리기" onClick={() => onQuantity(Number(quantity || 0) + 1)}>+</button>
                    <select aria-label="단위" value={unit} onChange={(e) => onUnit(e.target.value)}>
                        {units.map((u) => <option key={u}>{u}</option>)}
                    </select>
                    {quantityExtra}
                </div>
            </div>

            <fieldset className="ding-field">
                <legend className="ding-label">어디에 보관하나요?</legend>
                <div className="ding-storages">
                    {STORAGES.map(([s, desc]) => (
                        <label key={s} className={storage === s ? "is-on" : undefined}>
                            <input type="radio" name="storage" checked={storage === s} onChange={() => onStorage(s)} />
                            <strong>{s}</strong>
                            <small>{desc}</small>
                        </label>
                    ))}
                </div>
            </fieldset>

            <div className="ding-field">
                <label htmlFor="ding-expiry" className="ding-label">유통기한</label>
                <div className="ding-expiry">
                    <input id="ding-expiry" type="date" value={expiryDate} min={minDate} onChange={(e) => onExpiry(e.target.value)} />
                    <span className={`ding-badge ${badge.className}`}>{badge.label}</span>
                </div>
                <div className="ding-quick" role="group" aria-label="유통기한 빠르게 고르기 (오늘부터)">
                    {QUICK_DAYS.map((d) => {
                        const key = addDays(today, d);
                        return (
                            <button key={d} type="button" aria-pressed={expiryDate === key} onClick={() => onExpiry(key)}>
                                {d === 30 ? "한 달" : `${d}일`}
                            </button>
                        );
                    })}
                    {allowNoExpiry && <button type="button" aria-pressed={!expiryDate} onClick={() => onExpiry("")}>기한 없음</button>}
                </div>
            </div>
        </>
    );
};

export default IngredientFields;
