/* import Box from "../components/fridge/Box";

const Fridge = () => {
    return <><Box/></>
}
export default Fridge;

*/

import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router";

import Box from "../components/fridge/Box";
import List from "../components/fridge/List";

import logo from "../assets/Logo_FridgeO.svg";
import backIcon from "../assets/lucide_chevron_left_icon.png";
import searchIcon from "../assets/lucide_search_icon.png";
import plusIcon from "../assets/lucide_circle_plus_icon.png";

import "../styles/fridge.css";

import "../vendor/lucian-icons/sort.js";
import "../vendor/lucian-icons/grid.js";

import { fridgeIngredients } from "../utils/fridgeData";

import {
  getTodayKey,
  filterAndSortIngredients,
} from "../utils/fridgeUtils";

import { applyIngredientEdits } from "../utils/fridgeEdit";

const filters = [
  { value: "expiry", label: "유통기한순" },
  { value: "name", label: "재료 이름순" },
  { value: "storage", label: "보관 장소순" },
];

const Fridge = () => {
  const navigate = useNavigate();
  const [keyword, setKeyword] = useState("");
  const [sortBy, setSortBy] = useState("expiry");
  const [viewMode, setViewMode] = useState("list");

  const [mode, setMode] = useState(null);

const [deletedIds, setDeletedIds] = useState(() => {
  try {
    const saved = JSON.parse(
      localStorage.getItem("fridgeo:deleted-ingredient-ids") ?? "[]",
    );
    return Array.isArray(saved) ? saved : [];
  } catch {
    return [];
  }
});

function handleDeleteIngredient(id) {
  const nextIds = [...new Set([...deletedIds, id])];

  try {
    localStorage.setItem(
      "fridgeo:deleted-ingredient-ids",
      JSON.stringify(nextIds),
    );
    setDeletedIds(nextIds);
  } catch {
    alert("삭제 내용을 저장하지 못했어요.");
  }
}

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

    // 검색어와 정렬 기준을 반영한 재료 목록
  const visibleIngredients = filterAndSortIngredients(
  applyIngredientEdits(
    fridgeIngredients.filter((item) => !deletedIds.includes(item.id)),
  ),
  keyword,
  sortBy,
);

const ingredientViewProps = {
  items: visibleIngredients,
  today,
  onDeleteIngredient: mode === "delete" ? handleDeleteIngredient : undefined,
  onSelectIngredient: mode === "edit" ? handleSelectIngredient : undefined,
};

  return (
    <div className="fridge-page">
      <header className="fridge-header">
        <Link to="/" className="fridge-back" aria-label="홈으로">
          <img src={backIcon} alt="" />
        </Link>

        <Link to="/" className="fridge-logo" aria-label="FridgeO 홈">
          <img src={logo} alt="FridgeO" />
        </Link>

        <label className="fridge-search">
          <img src={searchIcon} alt="" />

          <input
            type="search"
            aria-label="냉장고 안 재료 검색"
            placeholder="냉장고 안 재료를 검색해보세요"
            value={keyword}
            onChange={(event) => setKeyword(event.target.value)}
          />
        </label>
      </header>

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
  className={`fridge-content fridge-content--${viewMode}`}
  aria-label="보관 중인 식재료"
>
  {visibleIngredients.length === 0 ? (
    <p className="fridge-empty">검색한 재료가 없어요.</p>
  ) : viewMode === "list" ? (
    <List {...ingredientViewProps} />
  ) : (
    <Box {...ingredientViewProps} />
  )}
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