import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router";
import Header from "../components/Header.jsx";
import BookmarkList from "../components/Recipe/BookmarkList.jsx";
import { apiFetch } from "../utils/auth";
import "../styles/bookmark.css";

// 내 북마크 (/bookmark): DB recipe_bookmarks 를 최근 저장한 순으로 (최대 50개). 카드·목록 그리기는 components/Recipe
const BookMark = () => {
    const navigate = useNavigate();
    const [recipes, setRecipes] = useState(null); // 불러오기 전 null
    const [error, setError] = useState("");
    const [removingId, setRemovingId] = useState(null);

    const load = useCallback(
        () => apiFetch("/api/me/bookmarks").then(setRecipes).catch((e) => setError(e.message)),
        [],
    );

    useEffect(() => { load(); }, [load]);

    // 다시 시도: "불러오는 중"으로 돌린 뒤 다시 받기
    const retry = () => {
        setError("");
        setRecipes(null);
        load();
    };

    // 화면에서 먼저 빼고 DB 에서 해제, 실패하면 되돌림
    const remove = async (id) => {
        const before = recipes;
        setRemovingId(id);
        setRecipes((prev) => prev.filter((r) => r.id !== id));
        try {
            await apiFetch(`/api/recipes/${encodeURIComponent(id)}/bookmark`, { method: "DELETE" });
        } catch (e) {
            setRecipes(before);
            alert(`북마크를 해제하지 못했어요. ${e.message}`);
        } finally {
            setRemovingId(null);
        }
    };

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
