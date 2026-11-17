import { useState } from "react";
import { Link } from "react-router";
import ProfileCard from "../../components/mobile/MyPage/ProfileCard.jsx";
import MenuList from "../../components/mobile/MyPage/MenuList.jsx";
import StatPanel from "../../components/mobile/MyPage/StatPanel.jsx";
import MyRecipeGrid from "../../components/desktop/mypage/MyRecipeGrid";
import RecipeCard from "../../components/desktop/recipe/RecipeCard";
import { useMe, useMyBookmarks } from "../../queries/me";
import { readRecentRecipes } from "../../utils/recentRecipes";
import "../../styles/mobile/MyPage.css"; // 프로필·메뉴·팔로우 목록은 모바일 컴포넌트와 스타일을 그대로 씀
import "../../styles/desktop/recipes.css"; // 북마크 레시피 카드
import "../../styles/desktop/mypage.css";

const BOOKMARK_PREVIEW = 8;

// 데스크탑 마이페이지: 왼쪽(고정) 프로필·숫자·메뉴 | 오른쪽 내가 쓴 레시피·북마크·최근 본 레시피·팔로우를 한 번에
// (모바일은 북마크·팔로우를 숫자를 눌러 펼쳐 봄)
const MyPage = () => {
    const me = useMe().data ?? null; // 내 프로필 + 북마크·팔로잉·팔로워 수 + 임박 재료 (GET /api/me)
    const bookmarkQuery = useMyBookmarks();
    const bookmarks = bookmarkQuery.data ?? (bookmarkQuery.isError ? [] : null); // 받기 전 null, 실패하면 빈 목록
    const [recent] = useState(readRecentRecipes);

    const stats = [
        ["북마크", me?.bookmark_count],
        ["팔로잉", me?.following_count],
        ["팔로워", me?.follower_count],
    ];

    return (
        <div className="dmypage">
            <aside className="dmypage-side">
                <ProfileCard me={me} />
                <dl className="mypage-card dmypage-stats">
                    {stats.map(([label, value]) => (
                        <div key={label}>
                            <dt>{label}</dt>
                            <dd>{value ?? "-"}</dd>
                        </div>
                    ))}
                </dl>
                <MenuList me={me} />
            </aside>

            <main className="dmypage-main">
                <MyRecipeGrid />

                <section className="dmypage-section" aria-labelledby="dmypage-bookmark-title">
                    <div className="dmypage-section-head">
                        <h2 id="dmypage-bookmark-title">북마크한 레시피 {bookmarks && <span>{bookmarks.length}</span>}</h2>
                        {bookmarks?.length > BOOKMARK_PREVIEW && <Link to="/bookmark" className="dmypage-head-link">전체 보기 ›</Link>}
                    </div>
                    {bookmarks === null ? (
                        <p className="dmypage-note" role="status">불러오는 중...</p>
                    ) : bookmarks.length === 0 ? (
                        <p className="dmypage-note">아직 북마크한 레시피가 없어요. 레시피 사진 옆 북마크를 눌러 보세요.</p>
                    ) : (
                        <ul className="drecipe-grid">
                            {bookmarks.slice(0, BOOKMARK_PREVIEW).map((r) => <li key={r.id}><RecipeCard recipe={r} /></li>)}
                        </ul>
                    )}
                </section>

                <section className="dmypage-section" aria-labelledby="dmypage-recent-title">
                    <div className="dmypage-section-head">
                        <h2 id="dmypage-recent-title">최근 본 레시피</h2>
                    </div>
                    {recent.length === 0 ? (
                        <p className="dmypage-note">아직 본 레시피가 없어요. <Link to="/recipe">레시피 보러 가기 ›</Link></p>
                    ) : (
                        <ul className="dmypage-recent">
                            {recent.map((r) => (
                                <li key={r.id}>
                                    <Link to={`/recipe/${r.id}`}>
                                        <span className="dmypage-thumb">
                                            {r.image_url && <img src={r.image_url} alt="" loading="lazy" referrerPolicy="no-referrer" />}
                                        </span>
                                        <span>{r.title}</span>
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    )}
                </section>

                {me && (
                    <section className="dmypage-section" aria-labelledby="dmypage-follow-title">
                        <div className="dmypage-section-head">
                            <h2 id="dmypage-follow-title">팔로우</h2>
                        </div>
                        <StatPanel kind="follows" me={me} />
                    </section>
                )}
            </main>
        </div>
    );
};

export default MyPage;
