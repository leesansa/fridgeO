import BookmarkCard from "./BookmarkCard";

// 북마크 목록: 불러오는 중 / 오류 / 비었음 / 카드들
const BookmarkList = ({ recipes, error, removingId, onOpen, onRemove, onRetry, onBrowse }) => {
    if (error) {
        return (
            <p className="bookmark-status" role="alert">
                {error} <button type="button" className="bookmark-link" onClick={onRetry}>다시 시도</button>
            </p>
        );
    }
    if (!recipes) return <p className="bookmark-status">불러오는 중…</p>;
    if (recipes.length === 0) {
        return (
            <p className="bookmark-status">
                아직 북마크한 레시피가 없어요.
                <br />
                <button type="button" className="bookmark-link" onClick={onBrowse}>레시피 보러 가기 &gt;</button>
            </p>
        );
    }
    return (
        <ul className="bookmark-list" aria-label="북마크한 레시피">
            {recipes.map((recipe) => (
                <BookmarkCard
                    key={recipe.id}
                    recipe={recipe}
                    removing={removingId === recipe.id}
                    onOpen={onOpen}
                    onRemove={onRemove}
                />
            ))}
        </ul>
    );
};

export default BookmarkList;
