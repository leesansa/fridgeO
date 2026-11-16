import { useRecipePages } from "../../../utils/useRecipePages";
import RecipeCard from "./RecipeCard";

// 데스크탑 레시피 카드 격자 (무한 스크롤, 화면 전체 스크롤 기준). 분류·검색어가 바뀌면 부모가 key 로 새로 만듦
const RecipeGrid = ({ categoryId, q }) => {
    const { recipes, error, setError, done, sentinelRef } = useRecipePages({ categoryId, q });

    return (
        <>
            <ul className="drecipe-grid">
                {recipes.map((r) => <li key={r.id}><RecipeCard recipe={r} /></li>)}
            </ul>
            <div ref={sentinelRef} aria-hidden="true" />
            {error && (
                <p className="drecipe-status" role="alert">
                    {error} <button type="button" onClick={() => setError("")}>다시 시도</button>
                </p>
            )}
            {done && recipes.length === 0 && (
                <p className="drecipe-status">{q ? `'${q}'에 맞는 레시피가 없어요.` : "레시피가 없습니다."}</p>
            )}
        </>
    );
};

export default RecipeGrid;
