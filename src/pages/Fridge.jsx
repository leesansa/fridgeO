import { useEffect, useRef, useState } from "react";
import { useNavigate, useSearchParams } from "react-router";
import Header from "../components/Header";
import SortFilter from "../components/fridge/SortFilter";
import FridgeToolbar from "../components/fridge/FridgeToolbar";
import FridgeItems from "../components/fridge/FridgeItems";
import AddButton from "../components/fridge/AddButton";
import { getTodayKey } from "../utils/fridgeUtils";
import "../styles/fridge.css";

// 내 냉장고: 검색어·정렬·보기 방식·삭제/편집 모드·오늘 날짜만 여기서 관리하고, 각 영역은 components/fridge
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
        <FridgeToolbar mode={mode} onModeChange={setMode} viewMode={viewMode} onViewModeChange={setViewMode} />

        <section ref={contentRef} className={`fridge-content fridge-content--${viewMode}`} aria-label="보관 중인 식재료">
          <FridgeItems
            key={`${sortBy}|${q}`}
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
