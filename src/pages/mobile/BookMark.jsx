import { useNavigate } from "react-router";
import Header from "../../components/mobile/Header.jsx";
import BookmarkList from "../../components/mobile/Recipe/Bookmark/BookmarkList.jsx";
import { useMyBookmarks } from "../../queries/me";
import { useSetBookmark } from "../../queries/reviews";
import "../../styles/mobile/bookmark.css";

// 내 북마크 (/bookmark): 불러오기·해제는 queries 훅. 카드·목록 그리기는 components/Recipe
const BookMark = () => {
    const navigate = useNavigate();
    const { data: recipes = null, error: loadError, refetch: retry } = useMyBookmarks(); // 불러오기 전 null
    const { mutate: setBookmark, isPending, variables } = useSetBookmark();
    const error = loadError?.message ?? "";
    const removingId = isPending ? variables.recipeId : null;
    // 목록에서 먼저 빼고 해제, 실패하면 되돌리고 alert
    const remove = (id) => setBookmark({ recipeId: id, on: false }, { onError: (e) => alert(`북마크를 해제하지 못했어요. ${e.message}`) });

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
