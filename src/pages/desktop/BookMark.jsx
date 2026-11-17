import { useState } from "react";
import { Link } from "react-router";
import RecipeCard from "../../components/desktop/recipe/RecipeCard";
import { useBookmarks } from "../../hooks/useBookmarks";
import "../../vendor/lucian-icons/bookmark.js"; // 레시피 상세와 같은 북마크 아이콘
import "../../styles/desktop/recipes.css"; // 레시피 카드
import "../../styles/desktop/bookmark.css";

// 정렬: 서버가 최근 저장한 순으로 줌 → 그 순서가 "saved"
const SORTS = {
    saved: ["최근 저장순", () => 0],
    rating: ["별점 높은순", (a, b) => (b.rating ?? 0) - (a.rating ?? 0)],
    reviews: ["리뷰 많은순", (a, b) => b.review_count - a.review_count],
};

// 데스크탑 내 북마크: 레시피 카드 격자 + 카드마다 북마크 해제 버튼. 북마크 안에서 찾기·정렬 (최대 50개라 화면에서 처리)
// 불러오기·해제는 모바일과 같은 useBookmarks
const BookMark = () => {
    const { recipes, error, removingId, retry, remove } = useBookmarks();
    const [text, setText] = useState("");
    const [sort, setSort] = useState("saved");
    const word = text.trim().toLowerCase();
    const shown = (recipes ?? [])
        .filter((r) => !word || r.title.toLowerCase().includes(word) || (r.author ?? "").toLowerCase().includes(word))
        .toSorted(SORTS[sort][1]);

    return (
        <div className="dbookmark">
            <nav className="dbookmark-crumbs" aria-label="현재 위치">
                <Link to="/mypage">마이페이지</Link> › <span aria-current="page">내 북마크</span>
            </nav>

            <div className="dbookmark-head">
                <h1>내 북마크 {recipes?.length > 0 && <span>{recipes.length}</span>}</h1>
                {recipes?.length > 0 && (
                    <div className="dbookmark-tools">
                        <input
                            type="search"
                            value={text}
                            onChange={(e) => setText(e.target.value)}
                            placeholder="북마크에서 제목·작성자 찾기"
                            aria-label="북마크에서 제목이나 작성자 찾기"
                        />
                        <select value={sort} onChange={(e) => setSort(e.target.value)} aria-label="정렬">
                            {Object.entries(SORTS).map(([key, [label]]) => <option key={key} value={key}>{label}</option>)}
                        </select>
                    </div>
                )}
            </div>

            {error ? (
                <p className="dbookmark-status" role="alert">
                    {error} <button type="button" onClick={retry}>다시 시도</button>
                </p>
            ) : !recipes ? (
                <p className="dbookmark-status" role="status">불러오는 중…</p>
            ) : recipes.length === 0 ? (
                <div className="dbookmark-empty">
                    <lucian-bookmark size="56" tone="line" accent="#57852f" aria-hidden="true" />
                    <p>아직 북마크한 레시피가 없어요. 레시피 상세의 북마크 버튼으로 저장해 보세요.</p>
                    <Link to="/recipe">레시피 보러 가기 ›</Link>
                </div>
            ) : shown.length === 0 ? (
                <p className="dbookmark-status">'{text.trim()}'에 맞는 북마크가 없어요.</p>
            ) : (
                <ul className="drecipe-grid dbookmark-grid">
                    {shown.map((r) => (
                        <li key={r.id}>
                            <RecipeCard recipe={r} highlight={word ? text.trim() : undefined} />
                            {/* 카드(링크) 밖에 둬야 링크 안에 버튼이 겹치지 않음. 위치만 카드 위로 */}
                            <button
                                type="button"
                                className="dbookmark-remove"
                                aria-label={`${r.title} 북마크 해제`}
                                title="북마크 해제"
                                disabled={removingId === r.id}
                                onClick={() => remove(r.id)}
                            >
                                {/* state 는 getter 전용이라 attribute 로 설정 (모바일 BookmarkCard 와 같음) */}
                                <lucian-bookmark size="22" tone="line" accent="#57852f" aria-hidden="true" ref={(el) => el?.setAttribute("state", "on")} />
                            </button>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
};

export default BookMark;
