import { Link, NavLink } from "react-router";
import "../../styles/desktop/DesktopHeader.css";
import "../../vendor/lucian-icons/bell.js";
import MainSearch from "../mobile/MainPage/MainSearch.jsx";
import CategoryMenu from "./CategoryMenu.jsx";
import logo from "../../assets/Logo_FridgeO.svg";
import script from "../../assets/fridgeO_script.png";
import userIcon from "../../assets/lucide_user_icon.png";
import fridgeIcon from "../../assets/lucide_refrigerator_icon.png";

const tabs = [
    { label: "홈", to: "/", end: true },
    { label: "레시피", to: "/recipe" },
    { label: "냉장고", to: "/fridge" },
    { label: "내 레시피 관리", to: "/mypage" },
];

// 데스크탑(1024px 이상) 공통 헤더: 하단 바(Navigation) 대신 위쪽 탭. 보이고 숨기는 건 DesktopHeader.css
const DesktopHeader = ({ hasUnread }) => (
    <header className="desk-header">
        <div className="desk-top">
            <Link to="/" className="desk-logo" aria-label="fridgeO 홈으로">
                <img src={logo} alt="" />
                <span className="desk-logo-bar" aria-hidden="true" />
                <img className="desk-logo-script" src={script} alt="" />
            </Link>
            <MainSearch className="desk-search" />
            <div className="desk-icons">
                <Link to="/mypage" aria-label="마이페이지"><img src={userIcon} alt="" /></Link>
                <Link to="/fridge" aria-label="냉장고"><img src={fridgeIcon} alt="" /></Link>
                <Link to="/notification" className="desk-bell" aria-label={hasUnread ? "알림, 새 알림 있음" : "알림"}>
                    <lucian-bell size="30" />
                    {hasUnread && <span className="desk-bell-dot" aria-hidden="true" />}
                </Link>
            </div>
        </div>
        <nav className="desk-nav" aria-label="주요 메뉴">
            <CategoryMenu />
            <ul className="desk-tabs">
                {tabs.map((tab) => (
                    <li key={tab.to}>
                        <NavLink to={tab.to} end={tab.end}>{tab.label}</NavLink>
                    </li>
                ))}
            </ul>
        </nav>
    </header>
);

export default DesktopHeader;
