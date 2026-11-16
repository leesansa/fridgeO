import { useCallback, useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router";
import StorageColumn from "../../components/desktop/fridge/StorageColumn";
import DetailPanel from "../../components/desktop/fridge/DetailPanel";
import { apiFetch } from "../../utils/auth";
import { getTodayKey } from "../../utils/fridgeUtils";
import "../../styles/desktop/fridge.css";

const STORAGES = ["냉장", "냉동", "실온"];
const STATUSES = [[null, "전체"], ["urgent", "임박"], ["expired", "지남"], ["empty", "다 떨어짐"]];

// 데스크탑 내 냉장고: 냉장·냉동·실온 세 칸 + 오른쪽 상세 패널
// 카드를 다른 칸으로 끌어다 놓으면 보관 장소가 바뀜 (모바일에 없는 기능, 키보드는 상세 패널의 보관 장소 선택)
const Fridge = () => {
  const navigate = useNavigate();
  // 메인 조미료 아이콘에서 /fridge?q=케첩, /fridge?category=조미료 로 오면 모바일처럼 바로 걸러서 보여 줌
  const [searchParams] = useSearchParams();
  const [keyword, setKeyword] = useState(() => searchParams.get("q")?.trim() ?? "");
  const [q, setQ] = useState(keyword); // 입력이 0.3초 멈추면 반영
  const [status, setStatus] = useState(null);
  const [condimentOnly, setCondimentOnly] = useState(() => searchParams.get("category") === "조미료");
  const [hasCondiments, setHasCondiments] = useState(false);
  const [totals, setTotals] = useState({});
  const [selected, setSelected] = useState(null); // 고른 재료 (DB 행)
  const [version, setVersion] = useState(0); // 재료를 바꾸면 +1 → 세 칸을 처음부터 다시 받음
  const [busy, setBusy] = useState(false);
  const [today] = useState(getTodayKey);

  useEffect(() => {
    apiFetch("/api/fridge/condiments").then((rows) => setHasCondiments(rows.length > 0)).catch(() => {});
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => setQ(keyword.trim()), 300);
    return () => clearTimeout(timer);
  }, [keyword]);

  const onTotal = useCallback((storage, n) => setTotals((prev) => ({ ...prev, [storage]: n })), []);

  // PATCH 는 등록과 같은 전체 값을 받으므로 행 값에 바뀐 것만 덮어써서 보냄
  const update = async (row, changes) => {
    const next = { ...row, ...changes };
    setBusy(true);
    try {
      await apiFetch(`/api/ingredients/${row.id}`, {
        method: "PATCH",
        body: { name: next.name, quantity: next.quantity, unit: next.unit, storage: next.storage, expiryDate: next.expiry_date },
      });
      setSelected((s) => (s?.id === row.id ? next : s));
      setVersion((v) => v + 1);
    } catch (e) {
      alert(`재료를 바꾸지 못했어요. ${e.message}`);
    } finally {
      setBusy(false);
    }
  };

  const remove = async (row) => {
    if (!confirm(`'${row.name}'을(를) 삭제할까요? 되돌릴 수 없어요.`)) return;
    setBusy(true);
    try {
      await apiFetch(`/api/ingredients/${row.id}`, { method: "DELETE" });
      setSelected(null);
      setVersion((v) => v + 1);
    } catch (e) {
      alert(`삭제하지 못했어요. ${e.message}`);
    } finally {
      setBusy(false);
    }
  };

  const params = { q, status, category: condimentOnly ? "조미료" : null };
  const listKey = `${q}|${status}|${condimentOnly}|${version}`;
  const sum = STORAGES.reduce((n, s) => n + (totals[s] ?? 0), 0);

  return (
    <div className="dfridge">
      <div className="dfridge-bar">
        <h1>
          내 냉장고 <span>{sum}개</span>
        </h1>
        <p className="dfridge-counts">{STORAGES.map((s) => `${s} ${totals[s] ?? 0}`).join(" · ")}</p>
        <input
          className="dfridge-search"
          type="search"
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
          placeholder="냉장고 안 재료 검색"
          aria-label="냉장고 안 재료 검색"
        />
        <div className="dfridge-filters" role="group" aria-label="상태로 거르기">
          {STATUSES.map(([value, label]) => (
            <button key={label} type="button" aria-pressed={status === value} onClick={() => setStatus(value)}>
              {label}
            </button>
          ))}
          {(hasCondiments || condimentOnly) && (
            <button type="button" aria-pressed={condimentOnly} onClick={() => setCondimentOnly(!condimentOnly)}>
              조미료
            </button>
          )}
        </div>
        <button type="button" className="dfridge-add" onClick={() => navigate("/ingredient")}>
          + 재료 추가
        </button>
      </div>

      <p className="dfridge-hint">카드를 다른 칸으로 끌어다 놓으면 보관 장소가 바뀌어요.</p>

      <div className="dfridge-board">
        {STORAGES.map((s) => (
          <StorageColumn
            key={`${s}|${listKey}`}
            storage={s}
            params={params}
            today={today}
            selectedId={selected?.id}
            onSelect={setSelected}
            onTotal={onTotal}
            onMove={(row, storage) => update(row, { storage })}
          />
        ))}
        {selected ? (
          <DetailPanel key={selected.id} row={selected} today={today} busy={busy} onUpdate={update} onRemove={remove} />
        ) : (
          <aside className="dfridge-panel is-placeholder">
            <p>재료를 누르면 자세한 정보와 그 재료로 만들 수 있는 레시피가 여기에 나와요.</p>
          </aside>
        )}
      </div>
    </div>
  );
};

export default Fridge;
