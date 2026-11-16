import { useNavigate } from "react-router";
import search from "../../../assets/main/search.png";

// 메인 통합 검색창: Enter 하면 /search?q= (레시피 + 내 냉장고 재료) 로. 스타일은 styles/mobile/MainPage.css (데스크탑 헤더는 className 으로 styles/desktop/DesktopHeader.css)
const MainSearch = ({ className = "main-search" }) => {
    const navigate = useNavigate();

    return (
        <form
            role="search"
            onSubmit={(e) => {
                e.preventDefault();
                const q = String(new FormData(e.currentTarget).get("search")).trim();
                if (q) navigate(`/search?${new URLSearchParams({ q })}`);
            }}
        >
            <label className={className}>
                <img src={search} alt="" />
                <input type="text" name="search" maxLength={50} enterKeyHint="search" placeholder="레시피나 재료를 검색해보세요" aria-label="레시피나 재료 검색" />
            </label>
        </form>
    );
};

export default MainSearch;
