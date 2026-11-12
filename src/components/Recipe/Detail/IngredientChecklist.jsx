import { useState } from "react";
import "../../../vendor/lucian-icons/check.js"; // 065번 check 아이콘

const coupangUrl = (name) => `https://www.coupang.com/np/search?q=${encodeURIComponent(name)}`;

// 준비물 체크리스트. 체크 = 이미 갖고 있음: 처음엔 내 냉장고(DB, 서버가 준 in_fridge)로 채우고 눌러서 바꿀 수 있음
// 없는 재료는 쿠팡 검색으로 "담기"
const IngredientChecklist = ({ ingredients }) => {
    const [checked, setChecked] = useState(() => new Set(ingredients.filter((ing) => ing.in_fridge).map((ing) => ing.name)));
    const [blocked, setBlocked] = useState(0); // 팝업 차단으로 못 연 탭 수

    const toggle = (name) => setChecked((prev) => {
        const next = new Set(prev);
        if (!next.delete(name)) next.add(name);
        return next;
    });

    // 재료마다 쿠팡 검색 탭을 하나씩 연다. 브라우저가 한 번 클릭에 여러 탭을 막으면 막힌 개수를 알려 줌
    const openCoupangTabs = (items) => {
        const failed = items.filter((ing) => {
            const tab = window.open(coupangUrl(ing.name), "_blank"); // "noopener" 를 주면 항상 null 이라 막힘 여부를 알 수 없음
            if (tab) tab.opener = null; // 열린 쿠팡 페이지가 이 페이지를 건드리지 못하게
            return !tab;
        });
        setBlocked(failed.length);
    };

    if (ingredients.length === 0) return null;
    const missing = ingredients.filter((ing) => !checked.has(ing.name));

    return (
        <section className="detail-card" aria-label="준비물">
            <div className="detail-ing-head">
                <h2>준비물</h2>
                <span className="detail-have">{ingredients.length - missing.length}/{ingredients.length}개 준비됐어요</span>
            </div>
            <ul className="detail-ing-list">
                {ingredients.map((ing) => {
                    const have = checked.has(ing.name);
                    return (
                        <li key={ing.name} className={`detail-ing ${have ? "have" : "lack"}`}>
                            <label className="detail-ing-label">
                                <input type="checkbox" className="detail-check" checked={have} onChange={() => toggle(ing.name)} />
                                <span className="detail-ing-mark" aria-hidden="true">{have && <lucian-check size="26" />}</span>
                                <span className="detail-ing-name">{ing.name}</span>
                                <span className="detail-ing-amount">{ing.amount}</span>
                            </label>
                            {/* 이미 있는 재료는 담을 필요가 없어 버튼을 숨김 */}
                            {have
                                ? <span className="detail-ing-spacer" />
                                : <a className="detail-btn detail-ing-btn" href={coupangUrl(ing.name)} target="_blank" rel="noopener noreferrer" aria-label={`${ing.name} 쿠팡에서 찾기 (새 탭)`}>담기</a>}
                        </li>
                    );
                })}
            </ul>
            {missing.length > 0 && (
                // shortcut: 쿠팡은 여러 상품을 한 번에 담는 주소가 없어 재료마다 검색 결과 탭을 열어 줌, 쿠팡 파트너스 API 를 쓰게 되면 교체
                <button type="button" className="detail-btn detail-btn--wide" onClick={() => openCoupangTabs(missing)}>
                    없는 재료 {missing.length}개 장바구니에 담기
                </button>
            )}
            {blocked > 0 && (
                <p className="detail-popup-note" role="alert">
                    팝업 차단으로 {blocked}개 탭이 열리지 않았어요. 주소창의 팝업 차단 아이콘에서 이 사이트를 허용한 뒤 다시 눌러 주세요.
                </p>
            )}
        </section>
    );
};

export default IngredientChecklist;
