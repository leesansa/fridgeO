import { useEffect, useRef, useState } from "react";
import { useIngredientPages } from "../../../queries/ingredients";
import { retryList, useInfiniteScroll } from "../../../hooks/useInfiniteScroll";
import { getDaysLeft, getExpiryBadge } from "../../../utils/date";

export const DRAG_TYPE = "application/x-fridgeo-ingredient";

// 카드 오른쪽 상태: 다 떨어짐 > 기한 지남 > D-day 배지
const statusOf = (row, today) => {
  if (Number(row.quantity) === 0) return { label: "다 떨어짐", className: "is-empty" };
  const badge = getExpiryBadge(row.expiry_date, today);
  if (row.expiry_date && getDaysLeft(row.expiry_date, today) < 0) return { label: badge.label, className: "is-expired" };
  return badge;
};

// 데스크탑 냉장고의 보관 장소 한 칸 (냉장·냉동·실온). 유통기한 순 무한 스크롤
// 다른 칸의 카드를 여기로 끌어다 놓으면 onMove(행, 이 칸) → 보관 장소 변경
const StorageColumn = ({ storage, params, today, selectedId, onSelect, onTotal, onMove }) => {
  const listRef = useRef(null);
  const list = useIngredientPages({ sort: "expiry", storage, ...params });
  const sentinelRef = useInfiniteScroll(list, listRef);
  const items = list.data?.items ?? [];
  const total = list.data?.total ?? null;
  const loaded = list.isSuccess && !list.hasNextPage;
  const [over, setOver] = useState(false);

  useEffect(() => {
    if (total !== null) onTotal(storage, total);
  }, [total, storage, onTotal]);

  return (
    <section
      className={`dfridge-col${over ? " is-over" : ""}`}
      aria-label={`${storage} 칸`}
      onDragOver={(e) => {
        if (!e.dataTransfer.types.includes(DRAG_TYPE)) return;
        e.preventDefault();
        e.dataTransfer.dropEffect = "move";
        setOver(true);
      }}
      onDragLeave={(e) => !e.currentTarget.contains(e.relatedTarget) && setOver(false)}
      onDrop={(e) => {
        e.preventDefault();
        setOver(false);
        const row = JSON.parse(e.dataTransfer.getData(DRAG_TYPE));
        if (row.storage !== storage) onMove(row, storage);
      }}
    >
      <h2 className="dfridge-col-title">
        {storage} <span>{total ?? ""}</span>
      </h2>
      <ul ref={listRef} className="dfridge-list">
        {items.map((row) => {
          const status = statusOf(row, today);
          return (
            <li key={row.id}>
              <button
                type="button"
                className="dfridge-card"
                draggable
                aria-pressed={selectedId === row.id}
                onDragStart={(e) => {
                  e.dataTransfer.setData(DRAG_TYPE, JSON.stringify(row));
                  e.dataTransfer.effectAllowed = "move";
                }}
                onClick={() => onSelect(row)}
              >
                <span className="dfridge-photo" aria-hidden="true">
                  {row.image_url ? <img src={row.image_url} alt="" referrerPolicy="no-referrer" loading="lazy" /> : (row.name ?? "?")[0]}
                </span>
                <span className="dfridge-card-text">
                  <strong>{row.name ?? "이름 없음"}</strong>
                  <small>{row.quantity} {row.unit}</small>
                </span>
                <span className={`dfridge-badge ${status.className}`}>{status.label}</span>
              </button>
            </li>
          );
        })}
        <li ref={sentinelRef} aria-hidden="true" />
      </ul>
      {loaded && items.length === 0 && <p className="dfridge-empty">재료가 없어요.</p>}
      {list.isError && (
        <p className="dfridge-empty" role="alert">
          {list.error.message} <button type="button" onClick={() => retryList(list)}>다시 시도</button>
        </p>
      )}
    </section>
  );
};

export default StorageColumn;
