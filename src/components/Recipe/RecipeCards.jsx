import { useCallback, useEffect, useRef, useState } from "react";
import { apiFetch } from "../../utils/auth.js";
import RecipeCard from "./RecipeCard.jsx";

// 레시피 카드 무한 스크롤 (GET /api/recipes). 분류·검색어가 바뀌면 부모가 key 로 새로 만들어서 목록·cursor·스크롤이 처음부터 시작
const RecipeCards = ({ categoryId, q }) => {
    const [recipes, setRecipes] = useState([]);
    const [cursor, setCursor] = useState(0); // 다음에 불러올 위치, null 이면 끝
    const [error, setError] = useState("");
    const loadingRef = useRef(false); // 같은 페이지를 두 번 부르지 않게
    const listRef = useRef(null);
    const sentinelRef = useRef(null);

    const loadMore = useCallback(async () => {
        if (loadingRef.current || cursor === null) return;
        loadingRef.current = true;
        try {
            const query = new URLSearchParams({ cursor });
            if (categoryId !== null) query.set("category", categoryId);
            if (q) query.set("q", q);
            const data = await apiFetch(`/api/recipes?${query}`);
            setRecipes((prev) => [...prev, ...data.items]);
            setCursor(data.nextCursor);
        } catch (e) {
            setError(e.message);
        } finally {
            loadingRef.current = false;
        }
    }, [cursor, categoryId, q]);

    // 목록 끝(sentinel)이 보이면 다음 페이지. cursor 가 바뀌면 다시 관찰해서 화면이 찰 때까지 이어 불러옴
    useEffect(() => {
        if (error || cursor === null) return;
        const observer = new IntersectionObserver(
            ([entry]) => entry.isIntersecting && loadMore(),
            { root: listRef.current, rootMargin: "200px" },
        );
        observer.observe(sentinelRef.current);
        return () => observer.disconnect();
    }, [loadMore, error, cursor]);

    return (
        <div className="card-list" ref={listRef}>
            {recipes.map((r) => <RecipeCard key={r.id} recipe={r} />)}
            <div ref={sentinelRef} aria-hidden="true" />
            {error && (
                <p className="list-status" role="alert">
                    {error} <button type="button" onClick={() => setError("")}>다시 시도</button>
                </p>
            )}
            {cursor === null && recipes.length === 0 && (
                <p className="list-status">{q ? `'${q}'에 맞는 레시피가 없어요.` : "레시피가 없습니다."}</p>
            )}
        </div>
    );
};

export default RecipeCards;
