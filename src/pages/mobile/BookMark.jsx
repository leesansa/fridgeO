import { useNavigate } from "react-router";
import Header from "../../components/mobile/Header.jsx";
import BookmarkList from "../../components/mobile/Recipe/Bookmark/BookmarkList.jsx";
import { useBookmarks } from "../../utils/useBookmarks";
import "../../styles/mobile/bookmark.css";

// 내 북마크 (/bookmark): 불러오기·해제는 useBookmarks(데스크탑과 공통). 카드·목록 그리기는 components/Recipe
const BookMark = () => {
    const navigate = useNavigate();
    const { recipes, error, removingId, retry, remove } = useBookmarks();

    return (
        <div className="bookmark-page">
            <Header backTo="/mypage" onSearch={(q) => q && navigate(`/search?${new URLSearchParams({ q })}`)} />
            <main className="bookmark-main">
                <h1 className="bookmark-heading">
                    내 북마크{recipes?.length > 0 && <span className="bookmark-count"> {recipes.length}개</span>}
                </h1>
                <BookmarkList
                    recipes={recipes}
                    error={error}
                    removingId={removingId}
                    onOpen={(id) => navigate(`/recipe/${id}`)}
                    onRemove={remove}
                    onRetry={retry}
                    onBrowse={() => navigate("/recipe")}
                />
            </main>
        </div>
    );
};

export default BookMark;
