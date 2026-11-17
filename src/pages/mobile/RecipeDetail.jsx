import { useEffect } from "react";
import { useNavigate, useParams } from "react-router";
import Header from "../../components/mobile/Header.jsx";
import DetailHero from "../../components/mobile/Recipe/Detail/DetailHero.jsx";
import DetailInfo from "../../components/mobile/Recipe/Detail/DetailInfo.jsx";
import IngredientChecklist from "../../components/mobile/Recipe/Detail/IngredientChecklist.jsx";
import RecipeSteps from "../../components/mobile/Recipe/Detail/RecipeSteps.jsx";
import ReviewSummary from "../../components/mobile/Recipe/Review/ReviewSummary.jsx";
import ReviewList from "../../components/mobile/Recipe/Review/ReviewList.jsx";
import { useRecipe } from "../../queries/recipes";
import { addRecentRecipe } from "../../utils/recentRecipes";
import "../../styles/mobile/recipe-detail.css";

// 레시피 상세: 주소의 :id 로 DB 레시피(기본 정보·재료·recipe_steps)를 불러오고, 각 영역은 components/Recipe
const RecipeDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    // 헤더 검색창에서 Enter → 레시피 목록에서 그 검색어로 찾기
    const search = (q) => navigate(q ? `/recipe?q=${encodeURIComponent(q)}` : "/recipe");
    // 주소의 id 가 바뀌면 자동으로 "불러오는 중" (아래 영역들도 새로 만들어져 상태가 초기화됨)
    const { data: recipe, error } = useRecipe(id);
    // "최근 본 레시피"에 기록
    useEffect(() => {
        if (recipe) addRecentRecipe(recipe);
    }, [recipe]);

    return (
        <div className="detail-page">
            <Header onSearch={search} />
            <main className="detail-main">
                {!recipe ? (
                    <section className="detail-card">
                        <p className="detail-intro" role={error ? "alert" : "status"}>{error?.message || "레시피를 불러오는 중..."}</p>
                    </section>
                ) : (
                    <>
                        <DetailHero recipe={recipe} />
                        <DetailInfo recipe={recipe} />
                        <IngredientChecklist ingredients={recipe.ingredients} />
                        <RecipeSteps steps={recipe.steps} />
                        <ReviewSummary recipe={recipe} />
                        <ReviewList key={id} recipeId={id} total={recipe.review_count} />
                    </>
                )}
            </main>
        </div>
    );
};

export default RecipeDetail;
