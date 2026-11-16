import { formatDate, getDaysLeft, getExpiryBadge } from "../../../utils/fridgeUtils";

// 데스크탑 재료 등록·편집 오른쪽: 데스크탑 냉장고의 칸·카드 모양으로 입력하는 대로 바로 보여 줌
const IngredientPreview = ({ name, quantity, unit, storage, expiryDate, today }) => {
    const empty = quantity !== "" && Number(quantity) === 0;
    const badge = empty ? { label: "다 떨어짐", className: "is-empty" } : getExpiryBadge(expiryDate, today);
    const daysLeft = expiryDate ? getDaysLeft(expiryDate, today) : null;

    return (
        <section className="ding-card" aria-labelledby="ding-preview-title">
            <h2 id="ding-preview-title">냉장고에 이렇게 들어가요</h2>
            <div className="ding-preview-col">
                <span className="ding-preview-storage">{storage}</span>
                <div className="ding-preview">
                    <span className="ding-photo" aria-hidden="true">{name ? name[0] : "?"}</span>
                    <span className="ding-preview-text">
                        <strong>{name || "재료 이름"}</strong>
                        <small>{quantity || 0} {unit}</small>
                    </span>
                    <span className={`ding-badge ${badge.className}`}>{badge.label}</span>
                </div>
            </div>
            <p className="ding-preview-note">
                {empty ? "다 떨어진 재료로 남겨 둬요 (메인 \"다 떨어진 상품\"에 보여요)"
                    : expiryDate ? `${formatDate(expiryDate).slice(1)}까지${daysLeft <= 5 ? " · 5일 이하라 알림이 와요" : ""}`
                    : "유통기한 없이 보관해요"}
            </p>
        </section>
    );
};

export default IngredientPreview;
