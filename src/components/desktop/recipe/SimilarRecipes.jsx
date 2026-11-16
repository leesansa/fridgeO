import { useEffect, useState } from "react";
import { Link } from "react-router";
import { apiFetch } from "../../../utils/auth";
import RecipeCard from "./RecipeCard";

// 데스크탑 레시피 상세 맨 아래: 같은 분류의 다른 레시피 4개 (GET /api/recipes?category=). 없거나 실패하면 안 보임
const SimilarRecipes = ({ categoryId, excludeId, categoryName }) => {
    const [recipes, setRecipes] = useState([]);

    useEffect(() => {
        let alive = true;
        apiFetch(`/api/recipes?${new URLSearchParams({ category: categoryId })}`)
            .then((data) => alive && setRecipes(data.items.filter((r) => r.id !== excludeId).slice(0, 4)))
            .catch(() => {});
        return () => { alive = false; };
    }, [categoryId, excludeId]);

    if (recipes.length === 0) return null;

    return (
        <section className="ddetail-similar" aria-labelledby="ddetail-similar-title">
            <div className="ddetail-similar-head">
                <h2 id="ddetail-similar-title">{categoryName ?? "같은 분류"}의 다른 레시피</h2>
                <Link to={`/recipe?category=${categoryId}`}>더보기 ›</Link>
            </div>
            <ul className="drecipe-grid">
                {recipes.map((r) => <li key={r.id}><RecipeCard recipe={r} /></li>)}
            </ul>
        </section>
    );
};

export default SimilarRecipes;
