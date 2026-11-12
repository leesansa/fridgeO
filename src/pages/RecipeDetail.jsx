import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router";
import Header from "../components/Header.jsx";
import DetailHero from "../components/Recipe/Detail/DetailHero.jsx";
import DetailInfo from "../components/Recipe/Detail/DetailInfo.jsx";
import IngredientChecklist from "../components/Recipe/Detail/IngredientChecklist.jsx";
import RecipeSteps from "../components/Recipe/Detail/RecipeSteps.jsx";
import ReviewSummary from "../components/Recipe/Review/ReviewSummary.jsx";
import ReviewList from "../components/Recipe/Review/ReviewList.jsx";
import { apiFetch } from "../utils/auth.js";
import { addRecentRecipe } from "../utils/recentRecipes";
import "../styles/recipe-detail.css";

// 레시피 상세: 주소의 :id 로 DB 레시피(기본 정보·재료·recipe_steps)를 불러오고, 각 영역은 components/Recipe
const RecipeDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    // 헤더 검색창에서 Enter → 레시피 목록에서 그 검색어로 찾기
    const search = (q) => navigate(q ? `/recipe?q=${encodeURIComponent(q)}` : "/recipe");
    // 응답을 어느 id 것인지와 함께 보관 → 주소의 id 가 바뀌면 자동으로 "불러오는 중" (아래 영역들도 새로 만들어져 상태가 초기화됨)
    const [loaded, setLoaded] = useState({ id: null, recipe: null, error: "" });
    const recipe = loaded.id === id ? loaded.recipe : null;
    const error = loaded.id === id ? loaded.error : "";

    useEffect(() => {
        let ignore = false; // 다른 레시피로 바로 옮겨 가면 늦게 온 이전 응답은 버림
        apiFetch(`/api/recipes/${encodeURIComponent(id)}`)
            .then((data) => {
                if (ignore) return;
                setLoaded({ id, recipe: data, error: "" });
                addRecentRecipe(data); // 마이페이지 "최근 본 레시피"에 기록
            })
            .catch((e) => !ignore && setLoaded({ id, recipe: null, error: e.message }));
        return () => { ignore = true; };
    }, [id]);

    return (
        <div className="detail-page">
            <Header onSearch={search} />
            <main className="detail-main">
                {!recipe ? (
                    <section className="detail-card">
                        <p className="detail-intro" role={error ? "alert" : "status"}>{error || "레시피를 불러오는 중..."}</p>
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
