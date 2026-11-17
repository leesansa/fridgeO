import { useEffect, useState } from "react";
import { Link, useParams } from "react-router";
import DetailSummary from "../../components/desktop/recipe/DetailSummary";
import SimilarRecipes from "../../components/desktop/recipe/SimilarRecipes";
import IngredientChecklist from "../../components/mobile/Recipe/Detail/IngredientChecklist.jsx";
import ReviewSummary from "../../components/mobile/Recipe/Review/ReviewSummary.jsx";
import ReviewList from "../../components/mobile/Recipe/Review/ReviewList.jsx";
import { apiFetch } from "../../utils/auth";
import { useRecipeDetail } from "../../hooks/useRecipeDetail";
import "../../styles/mobile/recipe-detail.css"; // 준비물·리뷰는 모바일 컴포넌트와 스타일을 그대로 씀
import "../../styles/desktop/recipes.css"; // 같은 분류 레시피 카드
import "../../styles/desktop/recipe-detail.css";

// 데스크탑 레시피 상세: 위치(레시피 › 분류) → 큰 사진 + 요약 → 만드는 순서·리뷰 | 오른쪽 준비물·리뷰 요약 → 같은 분류 레시피
// 데이터·북마크는 모바일과 같은 useRecipeDetail·useRecipeBookmark
const RecipeDetail = () => {
    const { id } = useParams();
    const { recipe, error } = useRecipeDetail(id);
    const [categories, setCategories] = useState([]);

    useEffect(() => {
        apiFetch("/api/categories").then(setCategories).catch(() => {}); // 없으면 분류 이름만 안 보임
    }, []);

    if (!recipe) {
        return (
            <div className="detail-page ddetail">
                <p className="ddetail-status" role={error ? "alert" : "status"}>{error || "레시피를 불러오는 중..."}</p>
            </div>
        );
    }

    const categoryName = categories.find((c) => String(c.id) === String(recipe.category_id))?.name;

    return (
        <div className="detail-page ddetail">
            <nav className="ddetail-crumbs" aria-label="현재 위치">
                <Link to="/recipe">레시피</Link>
                {categoryName && <> › <Link to={`/recipe?category=${recipe.category_id}`}>{categoryName}</Link></>}
                {" › "}<span aria-current="page">{recipe.title}</span>
            </nav>

            <section className="ddetail-top">
                <div className="ddetail-photo">
                    {recipe.image_url && <img src={recipe.image_url} alt={`${recipe.title} 완성 사진`} referrerPolicy="no-referrer" />}
                </div>
                <DetailSummary key={id} recipe={recipe} categoryName={categoryName} />
            </section>

            <div className="ddetail-body">
                <div className="ddetail-main">
                    <section className="detail-card" aria-labelledby="ddetail-steps-title">
                        <h2 id="ddetail-steps-title">만드는 순서</h2>
                        <ol className="ddetail-steps">
                            {recipe.steps.map((step) => (
                                <li key={step.position} className={step.image_url ? "ddetail-step" : "ddetail-step is-text"}>
                                    {step.image_url && <img src={step.image_url} alt={`${step.position}단계 사진`} loading="lazy" referrerPolicy="no-referrer" />}
                                    <div>
                                        <span className="ddetail-step-no" aria-hidden="true">{step.position}</span>
                                        <p>{step.text}</p>
                                    </div>
                                </li>
                            ))}
                        </ol>
                    </section>
                    <ReviewList key={id} recipeId={id} total={recipe.review_count} />
                </div>

                <aside className="ddetail-side">
                    <IngredientChecklist key={id} ingredients={recipe.ingredients} />
                    <ReviewSummary recipe={recipe} />
                </aside>
            </div>

            {recipe.category_id && (
                <SimilarRecipes key={id} categoryId={recipe.category_id} excludeId={recipe.id} categoryName={categoryName} />
            )}
        </div>
    );
};

export default RecipeDetail;
