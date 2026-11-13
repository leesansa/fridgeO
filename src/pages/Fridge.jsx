import { useEffect, useRef, useState } from "react";
import { useNavigate, useSearchParams } from "react-router";
import Header from "../components/Header";
import SortFilter from "../components/fridge/SortFilter";
import FridgeToolbar from "../components/fridge/FridgeToolbar";
import FridgeItems from "../components/fridge/FridgeItems";
import AddButton from "../components/fridge/AddButton";
import { apiFetch } from "../utils/auth";
import { getTodayKey } from "../utils/fridgeUtils";
import "../styles/fridge.css";

// 내 냉장고: 검색어·정렬·보기 방식·삭제/편집 모드·조미료만 보기·오늘 날짜만 여기서 관리하고, 각 영역은 components/fridge
const Fridge = () => {
  const navigate = useNavigate();
  // 메인 조미료 아이콘에서 /fridge?q=케첩 처럼 오면 그 이름으로 바로 걸러서 보여 줌
  const [searchParams] = useSearchParams();
  const [keyword, setKeyword] = useState(() => searchParams.get("q")?.trim() ?? ""); // 입력창 글자
  const [q, setQ] = useState(keyword); // 실제 검색어 (입력이 0.3초 멈추면 반영)
  const contentRef = useRef(null); // 재료 스크롤 영역 = 무한 스크롤 기준
  const [sortBy, setSortBy] = useState("expiry");
  const [viewMode, setViewMode] = useState("list"); // "list" | "box"
  const [mode, setMode] = useState(null); // "delete" | "edit" | null
  // 조미료만 보기. 메인 "내 조미료들"에서 /fridge?category=조미료 로 오면 켜진 채 시작
  const [condimentOnly, setCondimentOnly] = useState(() => searchParams.get("category") === "조미료");
  const [hasCondiments, setHasCondiments] = useState(false); // 조미료가 하나도 없으면 조미료 버튼을 안 보여 줌

  useEffect(() => {
    apiFetch("/api/fridge/condiments").then((rows) => setHasCondiments(rows.length > 0)).catch(() => {});
  }, []);

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
        <SortFilter sortBy={sortBy} onChange={setSortBy} />
        <FridgeToolbar
          mode={mode}
          onModeChange={setMode}
          viewMode={viewMode}
          onViewModeChange={setViewMode}
          condimentOnly={condimentOnly}
          // 켜진 채 들어왔으면 조미료가 없어도 끌 수 있게 버튼은 보여 줌
          onCondimentOnlyChange={hasCondiments || condimentOnly ? setCondimentOnly : undefined}
        />

        <section ref={contentRef} className={`fridge-content fridge-content--${viewMode}`} aria-label="보관 중인 식재료">
          <FridgeItems
            key={`${sortBy}|${q}|${condimentOnly}`}
            category={condimentOnly ? "조미료" : null}
            sortBy={sortBy}
            q={q}
            viewMode={viewMode}
            mode={mode}
            today={today}
            rootRef={contentRef}
            onSelectIngredient={(id) => navigate(`/ingredient/edit/${encodeURIComponent(id)}`)}
          />
        </section>
      </main>

      <AddButton />
    </div>
  );
};

export default Fridge;
