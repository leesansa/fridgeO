import "../../vendor/lucian-icons/bookmark.js"; // 레시피 상세와 같은 북마크 아이콘

// 북마크한 레시피 카드 하나. 카드를 누르면 상세로, 오른쪽 북마크 아이콘을 누르면 북마크 해제
const BookmarkCard = ({ recipe, onOpen, onRemove, removing }) => (
    <li className="bookmark-card">
        <button type="button" className="bookmark-open" onClick={() => onOpen(recipe.id)}>
            {recipe.image_url
                ? <img className="bookmark-thumb" src={recipe.image_url} alt="" referrerPolicy="no-referrer" loading="lazy" />
                : <span className="bookmark-thumb" />}
            <span className="bookmark-info">
                <span className="bookmark-title">{recipe.title}</span>
                <span className="bookmark-meta">
                    {recipe.author ?? "fridgeO"}
                    {recipe.rating != null && ` · ★ ${recipe.rating} (${recipe.review_count})`}
                </span>
            </span>
        </button>
        <button
            type="button"
            className="bookmark-remove"
            aria-label={`${recipe.title} 북마크 해제`}
            disabled={removing}
            onClick={() => onRemove(recipe.id)}
        >
            {/* state 는 속성(getter 전용)이라 JSX 로 주면 React 가 덮어쓰려다 오류 → 상세 페이지처럼 attribute 로 설정 */}
            <lucian-bookmark size="26" tone="line" accent="#57852f" aria-hidden="true" ref={(el) => el?.setAttribute("state", "on")} />
        </button>
    </li>
);

export default BookmarkCard;
