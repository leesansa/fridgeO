import { Link } from "react-router";
import Header from "../../components/mobile/Header.jsx";
import CategoryBar from "../../components/mobile/Recipe/List/CategoryBar.jsx";
import RecipeCards from "../../components/mobile/Recipe/List/RecipeCards.jsx";
import { useRecipeListState } from "../../utils/useRecipeListState.js";
import "../../styles/mobile/recipes.css";

// 레시피 목록: 분류(DB)·고른 분류·검색어는 useRecipeListState(데스크탑과 공통), 분류 줄과 카드 목록은 components/Recipe
const RecipeList = () => {
    const { categories, selected, selectCategory, q, text, setText } = useRecipeListState();

    return (
        <div className="recipe-page">
            <CategoryBar categories={categories} selected={selected} onSelect={selectCategory} />
            <Header value={text} onChange={setText} />
            <RecipeCards key={`${selected ?? "all"}|${q}`} categoryId={selected} q={q} />
            {/* 로그인 안 했으면 router 가 로그인 화면으로 보냄 */}
            <Link to="/recipe/new" className="recipe-add">레시피 추가</Link>
        </div>
    );
};

export default RecipeList;
