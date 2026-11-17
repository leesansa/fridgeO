import { useCallback, useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router";
import StorageColumn from "../../components/desktop/fridge/StorageColumn";
import DetailPanel from "../../components/desktop/fridge/DetailPanel";
import { useCondiments, useDeleteIngredient, useUpdateIngredient } from "../../queries/ingredients";
import { getTodayKey } from "../../utils/date";
import "../../styles/desktop/fridge.css";

const STORAGES = ["냉장", "냉동", "실온"];
const STATUSES = [["urgent", "임박"], ["expired", "지남"]];

// 데스크탑 내 냉장고: 냉장·냉동·실온 세 칸 + 오른쪽 상세 패널
// 카드를 다른 칸으로 끌어다 놓으면 보관 장소가 바뀜 (모바일에 없는 기능, 키보드는 상세 패널의 보관 장소 선택)
const Fridge = () => {
  const navigate = useNavigate();
  // 메인 조미료 아이콘에서 /fridge?q=케첩, /fridge?category=조미료 로 오면 모바일처럼 바로 걸러서 보여 줌
  const [searchParams] = useSearchParams();
  const [keyword, setKeyword] = useState(() => searchParams.get("q")?.trim() ?? "");
  const [q, setQ] = useState(keyword); // 입력이 0.3초 멈추면 반영
  const [status, setStatus] = useState(null);
  const [byName, setByName] = useState(false); // 이름순 (끄면 기본 유통기한순)
  const [condimentOnly, setCondimentOnly] = useState(() => searchParams.get("category") === "조미료");
  const hasCondiments = (useCondiments().data?.length ?? 0) > 0;
  const [totals, setTotals] = useState({});
  const [selected, setSelected] = useState(null); // 고른 재료 (DB 행)
  const updateIngredient = useUpdateIngredient();
  const deleteIngredient = useDeleteIngredient();
  const busy = updateIngredient.isPending || deleteIngredient.isPending;
  const [today] = useState(getTodayKey);

  useEffect(() => {
    const timer = setTimeout(() => setQ(keyword.trim()), 300);
    return () => clearTimeout(timer);
  }, [keyword]);

  const onTotal = useCallback((storage, n) => setTotals((prev) => ({ ...prev, [storage]: n })), []);

  // PATCH 는 등록과 같은 전체 값을 받으므로 행 값에 바뀐 것만 덮어써서 보냄
  const update = async (row, changes) => {
    const next = { ...row, ...changes };
    try {
      await updateIngredient.mutateAsync({ id: row.id, body: { name: next.name, quantity: next.quantity, unit: next.unit, storage: next.storage, expiryDate: next.expiry_date } });
      setSelected((s) => (s?.id === row.id ? next : s)); // 세 칸 목록은 queries/ingredients 가 다시 받음
    } catch (e) {
      alert(`재료를 바꾸지 못했어요. ${e.message}`);
    }
  };

  const remove = async (row) => {
    if (!confirm(`'${row.name}'을(를) 삭제할까요? 되돌릴 수 없어요.`)) return;
    try {
      await deleteIngredient.mutateAsync(row.id);
      setSelected(null);
    } catch (e) {
      alert(`삭제하지 못했어요. ${e.message}`);
    }
  };

  const params = { q, status, sort: byName ? "name" : "expiry", category: condimentOnly ? "조미료" : null };
  const listKey = `${q}|${status}|${byName}|${condimentOnly}`;
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
        <div className="dfridge-filters" role="group" aria-label="거르기·정렬">
          <button type="button" aria-pressed={status === null} onClick={() => setStatus(null)}>전체</button>
          <button type="button" aria-pressed={byName} onClick={() => setByName(!byName)}>이름순</button>
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
