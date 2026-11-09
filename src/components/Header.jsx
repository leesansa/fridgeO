import { useNavigate, useSearchParams } from "react-router";
import logo from "../assets/recipe/logo.png";
import "../styles/Header.css";

// 모든 페이지 공통 헤더.
// value/onChange 를 주면 부모가 검색어를 관리하고, 안 주면 주소의 ?q= 값만 채워 둠
// backTo 를 주면 그 주소로, 안 주면 이전 페이지로 돌아감
const Header = ({ value, onChange, backTo = -1 }) => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const controlled = onChange !== undefined;

    return (
        <header className="app-header">
            <div className="header-bg" />
            <button type="button" className="back-btn" aria-label="뒤로가기" onClick={() => navigate(backTo)}>
                <svg viewBox="0 0 38 38" aria-hidden="true"><path d="M23 9 14.5 19 23 29" /></svg>
            </button>
            <img className="logo" src={logo} alt="" />
            {/* Enter 로 새로고침만 막음, 검색 동작은 페이지가 onChange 로 처리 */}
            <form className="search" role="search" onSubmit={(e) => e.preventDefault()}>
                <svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="11" cy="11" r="8" /><path d="m21 21-4.3-4.3" /></svg>
                <input
                    type="search"
                    placeholder="냉장고 안 재료를 검색해보세요"
                    aria-label="냉장고 안 재료 검색"
                    {...(controlled ? { value, onChange: (e) => onChange(e.target.value) } : { defaultValue: searchParams.get("q") ?? "" })}
                />
            </form>
        </header>
    );
};

export default Header;
