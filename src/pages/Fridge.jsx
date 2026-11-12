/* import Box from "../components/fridge/Box";

const Fridge = () => {
    return <><Box/></>
}
export default Fridge;

*/

import { useCallback, useEffect, useRef, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router";

import Header from "../components/Header";
import Box from "../components/fridge/Box";
import List from "../components/fridge/List";

import plusIcon from "../assets/lucide_circle_plus_icon.png";

import "../styles/fridge.css";

import "../vendor/lucian-icons/sort.js";
import "../vendor/lucian-icons/grid.js";

import { apiFetch } from "../utils/auth";
import { getTodayKey } from "../utils/fridgeUtils";

// DB 행 → List/Box 가 쓰는 모양 ({ id, name, quantity: "300g", storage, expiryDate: "YYYY-MM-DD" | null, image })
const toItem = (row) => ({
  id: row.id,
  name: row.name ?? "이름 없음",
  quantity: `${row.quantity}${row.unit}`,
  storage: row.storage,
  expiryDate: row.expiry_date,
  image: row.image_url,
});

// 내 냉장고 재료 (DB ingredients) 무한 스크롤. 정렬·검색어가 바뀌면 부모가 key 로 새로 만들어서 처음부터 다시
const FridgeItems = ({ sortBy, q, viewMode, mode, today, rootRef, onSelectIngredient }) => {
  const [items, setItems] = useState([]);
  const [nextOffset, setNextOffset] = useState(0); // null = 끝
  const [error, setError] = useState("");
  const loadingRef = useRef(false); // 같은 페이지를 두 번 부르지 않게
  const sentinelRef = useRef(null);

  const loadMore = useCallback(async () => {
    if (loadingRef.current || nextOffset === null) return;
    loadingRef.current = true;
    try {
      const query = new URLSearchParams({ sort: sortBy, offset: nextOffset });
      if (q) query.set("q", q);
      const data = await apiFetch(`/api/ingredients?${query}`);
      // 첫 페이지는 덮어써서 개발 모드(StrictMode)에서 두 번 불려도 중복되지 않게
      setItems((prev) => [...(nextOffset === 0 ? [] : prev), ...data.items.map(toItem)]);
      setNextOffset(data.nextOffset);
    } catch (e) {
      setError(e.message);
    } finally {
      loadingRef.current = false;
    }
  }, [nextOffset, sortBy, q]);

  // 목록 끝(sentinel)이 스크롤 영역에 보이면 다음 페이지. 화면이 찰 때까지 이어 불러옴
  useEffect(() => {
    if (error || nextOffset === null) return;
    const observer = new IntersectionObserver(
      ([entry]) => entry.isIntersecting && loadMore(),
      { root: rootRef.current, rootMargin: "200px" },
    );
    observer.observe(sentinelRef.current);
    return () => observer.disconnect();
  }, [loadMore, error, nextOffset, rootRef]);

  // 화면에서 먼저 빼고 DB 에서 삭제, 실패하면 되돌림
  async function handleDeleteIngredient(id) {
    const before = items;
    setItems((prev) => prev.filter((item) => item.id !== id));
    try {
      await apiFetch(`/api/ingredients/${encodeURIComponent(id)}`, { method: "DELETE" });
    } catch (e) {
      setItems(before);
      alert(`삭제하지 못했어요. ${e.message}`);
    }
  }

  const viewProps = {
    items,
    today,
    onDeleteIngredient: mode === "delete" ? handleDeleteIngredient : undefined,
    onSelectIngredient: mode === "edit" ? onSelectIngredient : undefined,
  };
  const loaded = nextOffset === null; // 끝까지 받았는데 0개면 "없음" 문구

  return (
    <>
      {items.length > 0 && (viewMode === "list" ? <List {...viewProps} /> : <Box {...viewProps} />)}
      {loaded && items.length === 0 && (
        <p className="fridge-empty">{q ? "검색한 재료가 없어요." : "냉장고에 재료가 없어요. + 버튼으로 추가해 보세요."}</p>
      )}
      {error && (
        <p className="fridge-empty" role="alert">
          {error} <button type="button" onClick={() => setError("")}>다시 시도</button>
        </p>
      )}
      <div ref={sentinelRef} aria-hidden="true" />
    </>
  );
};

const filters = [
  { value: "expiry", label: "유통기한순" },
  { value: "name", label: "재료 이름순" },
  { value: "storage", label: "보관 장소순" },
];

const Fridge = () => {
  const navigate = useNavigate();
  // 메인 조미료 아이콘에서 /fridge?q=케첩 처럼 오면 그 이름으로 바로 걸러서 보여 줌
  const [searchParams] = useSearchParams();
  const [keyword, setKeyword] = useState(() => searchParams.get("q")?.trim() ?? ""); // 입력창 글자
  const [q, setQ] = useState(keyword); // 실제 검색어 (입력이 0.3초 멈추면 반영)
  const contentRef = useRef(null); // 재료 스크롤 영역 = 무한 스크롤 기준
  const [sortBy, setSortBy] = useState("expiry");
  const [viewMode, setViewMode] = useState("list");

  const [mode, setMode] = useState(null);

function handleSelectIngredient(id) {
  navigate(`/ingredient/edit/${encodeURIComponent(id)}`);
}

  // 현재 대한민국 날짜
  const [today, setToday] = useState(() => getTodayKey());

  // 화면을 켜둔 채 날짜가 바뀌거나 다시 돌아오면 날짜 갱신
  useEffect(() => {
    const updateToday = () => setToday(getTodayKey());

    const timer = window.setInterval(updateToday, 60_000);
    window.addEventListener("focus", updateToday);

    return () => {
      window.clearInterval(timer);
      window.removeEventListener("focus", updateToday);
    };
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => setQ(keyword.trim()), 300);
    return () => clearTimeout(timer);
  }, [keyword]);

  return (
    <div className="fridge-page">
      <Header backTo="/" value={keyword} onChange={setKeyword} />

      <main className="fridge-main">
        <h1 className="fridge-sr-only">내 냉장고</h1>

        <div
  className="fridge-filters"
  role="group"
  aria-label="재료 정렬 기준"
  style={{
    "--filter-index": filters.findIndex(
      (filter) => filter.value === sortBy,
    ),
  }}
>
  {filters.map((filter) => (
    <button
      key={filter.value}
      type="button"
      className={sortBy === filter.value ? "is-active" : ""}
      aria-pressed={sortBy === filter.value}
      onClick={() => setSortBy(filter.value)}
    >
      <span>{filter.label}</span>
    </button>
  ))}

  <span className="fridge-filter-indicator" aria-hidden="true" />
</div>

        <div className="fridge-toolbar">
          <div className="fridge-actions">
            {/* 함수 이름 팀원과 맞추기 */}
            <button
  type="button"
  className="fridge-delete"
  aria-pressed={mode === "delete"}
  onClick={() => setMode((current) => (current === "delete" ? null : "delete"))}
>
  {mode === "delete" ? "삭제 완료" : "삭제하기"}
</button>

<button
  type="button"
  className="fridge-edit"
  aria-pressed={mode === "edit"}
  onClick={() => setMode((current) => (current === "edit" ? null : "edit"))}
>
  {mode === "edit" ? "선택 취소" : "편집하기"}
</button>
          </div>

          <div
            className="fridge-view-buttons"
            style={{ backgroundColor: "transparent" }}
            role="group"
            aria-label="재료 표시 방식"
          >
            <button
  type="button"
  className={viewMode === "list" ? "is-active" : ""}
  aria-label="목록형으로 보기"
  aria-pressed={viewMode === "list"}
  onClick={() => setViewMode("list")}
>
  <lucian-sort tone="line" />
</button>

<button
  type="button"
  className={viewMode === "box" ? "is-active" : ""}
  aria-label="박스형으로 보기"
  aria-pressed={viewMode === "box"}
  onClick={() => setViewMode("box")}
>
  <lucian-grid tone="line" />
    </button>
          </div>
        </div>

        <section
  ref={contentRef}
  className={`fridge-content fridge-content--${viewMode}`}
  aria-label="보관 중인 식재료"
>
  <FridgeItems
    key={`${sortBy}|${q}`}
    sortBy={sortBy}
    q={q}
    viewMode={viewMode}
    mode={mode}
    today={today}
    rootRef={contentRef}
    onSelectIngredient={handleSelectIngredient}
  />
</section>
      </main>

      <div className="fridge-add-position">
        <Link
          to="/ingredient"
          className="fridge-add-button"
          aria-label="식재료 추가"
        >
          <img src={plusIcon} alt="" />
        </Link>
      </div>
    </div>
  );
};

export default Fridge;