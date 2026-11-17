import { useRef } from "react";
import { useRecipePages } from "../../../../queries/recipes";
import { retryList, useInfiniteScroll } from "../../../../hooks/useInfiniteScroll";
import RecipeCard from "./RecipeCard.jsx";

// 레시피 카드 무한 스크롤 (GET /api/recipes). 분류·검색어가 바뀌면 부모가 key 로 새로 만들어서 목록·cursor·스크롤이 처음부터 시작
const RecipeCards = ({ categoryId, q }) => {
    const listRef = useRef(null);
    const list = useRecipePages({ categoryId, q });
    const sentinelRef = useInfiniteScroll(list, listRef);
    const recipes = list.data?.items ?? [];

    return (
        <div className="card-list" ref={listRef}>
            {recipes.map((r) => <RecipeCard key={r.id} recipe={r} />)}
            <div ref={sentinelRef} aria-hidden="true" />
            {list.isError && (
                <p className="list-status" role="alert">
                    {list.error.message} <button type="button" onClick={() => retryList(list)}>다시 시도</button>
                </p>
            )}
            {list.isSuccess && !list.hasNextPage && recipes.length === 0 && (
                <p className="list-status">{q ? `'${q}'에 맞는 레시피가 없어요.` : "레시피가 없습니다."}</p>
            )}
        </div>
    );
};

export default RecipeCards;
