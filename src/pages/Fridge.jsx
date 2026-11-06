/* import Box from "../components/fridge/Box";

const Fridge = () => {
    return <><Box/></>
}
export default Fridge; */

import { useEffect, useState } from "react";
import { Link, NavLink } from "react-router";

import Box from "../components/fridge/Box";
import List from "../components/fridge/List";

import logo from "../assets/Logo_FridgeO.svg";
import backIcon from "../assets/lucide_chevron_left_icon.png";
import searchIcon from "../assets/lucide_search_icon.png";
import plusIcon from "../assets/lucide_circle_plus_icon.png";
import homeIcon from "../assets/lucide_house_icon.png";
import fridgeIcon from "../assets/lucide_refrigerator_icon.png";
import recipeIcon from "../assets/lucide_recipe_icon.png";
import userIcon from "../assets/lucide_user_icon.png";

import "../styles/fridge.css";

import "../vendor/lucian-icons/sort.js";
import "../vendor/lucian-icons/grid.js";

import { fridgeIngredients } from "../utils/fridgeData";

import {
  getTodayKey,
  filterAndSortIngredients,
} from "../utils/fridgeUtils";

const filters = [
  { value: "expiry", label: "유통기한순" },
  { value: "name", label: "재료 이름순" },
  { value: "storage", label: "보관 장소순" },
];

const menus = [
  { path: "/", label: "홈", icon: homeIcon },
  { path: "/fridge", label: "냉장고", icon: fridgeIcon },
  { path: "/recipe", label: "레시피", icon: recipeIcon },
  { path: "/mypage", label: "마이페이지", icon: userIcon },
];

const Fridge = () => {
  const [keyword, setKeyword] = useState("");
  const [sortBy, setSortBy] = useState("storage");
  const [viewMode, setViewMode] = useState("list");

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
    fridgeIngredients,
    keyword,
    sortBy,
  );

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
            {/* 선택 기능을 구현한 다음 disabled를 제거하세요. */}
            <button
              type="button"
              className="fridge-delete"
              disabled
            >
              삭제하기
            </button>

            <button
              type="button"
              className="fridge-edit"
              disabled
            >
              편집하기
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
    <List items={visibleIngredients} today={today} />
  ) : (
    <Box items={visibleIngredients} today={today} />
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

      <nav className="fridge-navigation" aria-label="주요 메뉴">
        {menus.map((menu) => (
          <NavLink
            key={menu.path}
            to={menu.path}
            end={menu.path === "/"}
            aria-label={menu.label}
            className={({ isActive }) =>
              `fridge-nav-item ${isActive ? "is-active" : ""}`
            }
          >
            <img src={menu.icon} alt="" />
          </NavLink>
        ))}
      </nav>
    </div>
  );
};

export default Fridge;