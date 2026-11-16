import { Link, NavLink } from "react-router";

// 데스크탑 계정 화면(개인정보 관리·알림 설정) 왼쪽 메뉴. 스타일은 styles/desktop/account.css
const AccountMenu = () => (
    <nav className="daccount-menu" aria-label="계정 메뉴">
        <Link to="/mypage" className="daccount-back">‹ 마이페이지</Link>
        <NavLink to="/mypage/privacy">개인정보 관리</NavLink>
        <NavLink to="/mypage/settings">알림 설정 · 약관</NavLink>
    </nav>
);

export default AccountMenu;
