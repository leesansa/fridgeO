import { useState } from "react";
import Header from "../../components/mobile/Header";
import ProfileCard from "../../components/mobile/MyPage/ProfileCard.jsx";
import StatSummary from "../../components/mobile/MyPage/StatSummary.jsx";
import StatPanel from "../../components/mobile/MyPage/StatPanel.jsx";
import RecentRecipes from "../../components/mobile/MyPage/RecentRecipes.jsx";
import MyRecipes from "../../components/mobile/MyPage/MyRecipes.jsx";
import MenuList from "../../components/mobile/MyPage/MenuList.jsx";
import { useMe } from "../../queries/me";
import "../../styles/mobile/MyPage.css";

// 마이페이지: 내 정보(GET /api/me)와 펼친 목록만 여기서 관리하고, 각 영역은 components/MyPage
const MyPage = () => {
  const [searchQuery, setSearchQuery] = useState("");
  // 내 프로필(users 테이블) + 북마크·팔로잉·팔로워 수 + 임박 재료. 불러오기 전·실패 시엔 null
  const me = useMe().data ?? null;
  const [openStat, setOpenStat] = useState(null); // "bookmarks" | "follows" | null (펼친 목록)

  const toggleStat = (kind) => setOpenStat((current) => (current === kind ? null : kind));

  return (
    <div className="mypage">
      {/* 420 * 915 고정 프레임 */}
      <div className="mypage-frame">
        <Header backTo="/" value={searchQuery} onChange={setSearchQuery} />

        <main className="mypage-main">
          <ProfileCard me={me} />
          <StatSummary me={me} openStat={openStat} onToggle={toggleStat} />
          {me && openStat && <StatPanel key={openStat} kind={openStat} me={me} />}
          <MyRecipes />
          <RecentRecipes />
          <MenuList me={me} />
        </main>
      </div>
    </div>
  );
};

export default MyPage;
