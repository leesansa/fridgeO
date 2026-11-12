import { useState } from "react";
import { useNavigate } from "react-router";
import { authClient } from "../../utils/auth";
import { getExpiryBadge, getTodayKey } from "../../utils/fridgeUtils";

// 하단 메뉴: 내 냉장고 관리(유통기한 5일 이하 재료) · 개인정보 관리 · 알림 설정 | 동의/약관 · 로그아웃
const MenuList = ({ me }) => {
  const navigate = useNavigate();
  const [today] = useState(getTodayKey);
  const urgent = me?.urgent_ingredients ?? [];

  const handleLogout = async () => {
    await authClient.signOut();
    navigate("/login");
  };

  return (
    <div className="mypage-card mypage-menu">
      {/* 유통기한 5일 이하 재료 (DB). 누르면 내 냉장고로 */}
      <button type="button" className="mypage-menu-button" onClick={() => navigate("/fridge")}>
        <span className="mypage-menu-row">
          <span className="mypage-menu-text">내 냉장고 관리</span>
          {urgent.length > 0
            ? <span className="mypage-urgent-badge">임박 {urgent.length}개 &gt;</span>
            : <span className="mypage-menu-arrow">&gt;</span>}
        </span>
        {urgent.length > 0 && (
          <span className="mypage-urgent-list">
            {urgent.map((item) => (
              <span key={item.id} className="mypage-urgent-chip">
                {item.name} {getExpiryBadge(item.expiry_date, today).label}
              </span>
            ))}
          </span>
        )}
      </button>
      <div className="mypage-menu-divider" />
      <button type="button" className="mypage-menu-button mypage-menu-row" onClick={() => navigate("/mypage/privacy")}>
        <span className="mypage-menu-text">개인정보 관리</span>
        <span className="mypage-menu-arrow">&gt;</span>
      </button>
      <div className="mypage-menu-divider" />
      <button type="button" className="mypage-menu-button mypage-menu-row" onClick={() => navigate("/mypage/settings")}>
        <span className="mypage-menu-text">알림 설정 | 동의/약관</span>
        <span className="mypage-menu-arrow">&gt;</span>
      </button>
      <div className="mypage-menu-divider" />
      <button type="button" className="mypage-menu-button mypage-menu-row is-last" onClick={handleLogout}>
        <span className="mypage-menu-text">로그아웃</span>
        <span className="mypage-menu-arrow">&gt;</span>
      </button>
    </div>
  );
};

export default MenuList;
