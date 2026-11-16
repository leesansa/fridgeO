import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { apiFetch } from "../../../utils/auth";
import { formatDate, getDaysLeft, getExpiryBadge } from "../../../utils/fridgeUtils";

const STORAGES = ["냉장", "냉동", "실온"];
const shortDate = (key) => key.slice(5).replace("-", ".");

// 데스크탑 냉장고 오른쪽: 고른 재료의 자세한 정보 + 보관 장소 바꾸기(끌어다 놓기의 키보드 대안) + 이 재료로 만들 레시피
// 재료가 바뀌면 부모가 key 로 새로 만듦 (레시피 다시 받기)
const DetailPanel = ({ row, today, busy, onUpdate, onRemove }) => {
  const navigate = useNavigate();
  const [recipes, setRecipes] = useState(null);
  const name = row.name ?? "이름 없음";

  useEffect(() => {
    let alive = true;
    // 레시피 검색은 제목 또는 재료 이름으로 찾음
    apiFetch(`/api/recipes?${new URLSearchParams({ q: name })}`)
      .then((data) => alive && setRecipes(data.items.slice(0, 3)))
      .catch(() => alive && setRecipes([]));
    return () => { alive = false; };
  }, [name]);

  const badge = getExpiryBadge(row.expiry_date, today);
  const stored = getDaysLeft(today, row.created_at); // 등록하고 지난 날
  // 등록일 → 유통기한 중 얼마나 지났는지 (기한 없으면 막대 없음)
  const span = row.expiry_date ? getDaysLeft(row.expiry_date, row.created_at) : null;
  const ratio = span === null ? null : span <= 0 ? 1 : Math.min(1, Math.max(0, stored / span));
  const empty = Number(row.quantity) === 0;

  return (
    <aside className="dfridge-panel" aria-label={`${name} 자세히`}>
      <div className="dfridge-panel-head">
        <span className="dfridge-photo is-large" aria-hidden="true">
          {row.image_url ? <img src={row.image_url} alt="" referrerPolicy="no-referrer" /> : name[0]}
        </span>
        <div>
          <h2>{name}</h2>
          <span className={`dfridge-badge ${empty ? "is-empty" : badge.className}`}>{empty ? "다 떨어짐" : badge.label}</span>
        </div>
      </div>

      <dl className="dfridge-facts">
        <dt>수량</dt>
        <dd>{row.quantity} {row.unit}</dd>
        <dt>보관 장소</dt>
        <dd>
          <select aria-label="보관 장소" value={row.storage} disabled={busy} onChange={(e) => onUpdate(row, { storage: e.target.value })}>
            {STORAGES.map((s) => <option key={s}>{s}</option>)}
          </select>
        </dd>
        <dt>유통기한</dt>
        <dd>{row.expiry_date ? formatDate(row.expiry_date).slice(1) : "기한 없음"}</dd>
        <dt>등록일</dt>
        <dd>{shortDate(row.created_at)} · {stored === 0 ? "오늘 등록" : `${stored}일째 보관 중`}</dd>
      </dl>

      {ratio !== null && (
        <div className="dfridge-progress">
          <div className="dfridge-progress-label">
            <span>보관 기간</span>
            <span>{Math.min(stored, Math.max(span, 0))} / {Math.max(span, 0)}일</span>
          </div>
          <div
            className={`dfridge-progress-bar${ratio >= 1 ? " is-over" : ratio >= 0.7 ? " is-late" : ""}`}
            role="progressbar"
            aria-label="등록일부터 유통기한까지 지난 정도"
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={Math.round(ratio * 100)}
          >
            <span style={{ width: `${ratio * 100}%` }} />
          </div>
        </div>
      )}

      <div className="dfridge-panel-actions">
        <button type="button" className="dfridge-btn primary" disabled={busy || empty} onClick={() => onUpdate(row, { quantity: 0 })}>
          다 먹었어요
        </button>
        <button type="button" className="dfridge-btn" onClick={() => navigate(`/ingredient/edit/${row.id}`)}>수정</button>
        <button type="button" className="dfridge-btn danger" disabled={busy} onClick={() => onRemove(row)}>삭제</button>
      </div>

      <h3 className="dfridge-panel-sub">이 재료로 만들 수 있는 레시피</h3>
      {!recipes ? (
        <p className="dfridge-empty">레시피를 찾는 중…</p>
      ) : recipes.length === 0 ? (
        <p className="dfridge-empty">이 재료가 들어간 레시피가 없어요.</p>
      ) : (
        <ul className="dfridge-recipes">
          {recipes.map((r) => (
            <li key={r.id}>
              <button type="button" onClick={() => navigate(`/recipe/${r.id}`)}>
                <img src={r.image_url} alt="" referrerPolicy="no-referrer" loading="lazy" />
                <span>{r.title}</span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </aside>
  );
};

export default DetailPanel;
