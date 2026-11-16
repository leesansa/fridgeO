import { useRef } from "react";
import { useRecipePages } from "../../../../utils/useRecipePages.js";
import RecipeCard from "./RecipeCard.jsx";

// 레시피 카드 무한 스크롤 (GET /api/recipes). 분류·검색어가 바뀌면 부모가 key 로 새로 만들어서 목록·cursor·스크롤이 처음부터 시작
const RecipeCards = ({ categoryId, q }) => {
    const listRef = useRef(null);
    const { recipes, error, setError, done, sentinelRef } = useRecipePages({ categoryId, q }, listRef);

    return (
        <div className="card-list" ref={listRef}>
            {recipes.map((r) => <RecipeCard key={r.id} recipe={r} />)}
            <div ref={sentinelRef} aria-hidden="true" />
            {error && (
                <p className="list-status" role="alert">
                    {error} <button type="button" onClick={() => setError("")}>다시 시도</button>
                </p>
            )}
            {done && recipes.length === 0 && (
                <p className="list-status">{q ? `'${q}'에 맞는 레시피가 없어요.` : "레시피가 없습니다."}</p>
            )}
        </div>
    );
};

export default RecipeCards;
