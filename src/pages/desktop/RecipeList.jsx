import { useState } from "react";
import { Link } from "react-router";
import RecipeGrid from "../../components/desktop/recipe/RecipeGrid";
import CategoryIcon from "../../components/mobile/Recipe/List/CategoryIcon.jsx";
import { useRecipeListState } from "../../hooks/useRecipeListState";
import { readRecentRecipes } from "../../utils/recentRecipes";
import "../../styles/desktop/recipes.css";

// 데스크탑 레시피 목록: 분류를 한 번에 다 보여 주고(모바일은 7칸씩 넘김) 카드 격자 + 오른쪽 "최근 본 레시피"
// 분류·검색어 상태는 모바일과 같은 useRecipeListState (주소 ?category= ?q=)
const RecipeList = () => {
    const { categories, selected, selectCategory, q, text, setText } = useRecipeListState();
    const [recent] = useState(() => readRecentRecipes().slice(0, 5));
    const current = categories.find((c) => c.id === selected);

    return (
        <div className="drecipe">
            <div className="drecipe-bar">
                <h1>
                    레시피 <em>{current?.name ?? "전체"}</em>
                </h1>
                <input
                    className="drecipe-search"
                    type="search"
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    placeholder="레시피 제목이나 재료로 검색"
                    aria-label="레시피 제목이나 재료로 검색"
                />
                {/* 로그인 안 했으면 router 가 로그인 화면으로 보냄 */}
                <Link to="/recipe/new" className="drecipe-add">+ 레시피 추가</Link>
            </div>

            <div className="drecipe-cats" role="group" aria-label="레시피 분류">
                {categories.map((cat, i) => (
                    <button key={cat.id ?? "all"} type="button" aria-pressed={selected === cat.id} onClick={() => selectCategory(cat.id)}>
                        <CategoryIcon cat={cat} index={i} />
                        {cat.name}
                    </button>
                ))}
            </div>

            <div className="drecipe-layout">
                <section aria-label="레시피 목록">
                    <RecipeGrid key={`${selected ?? "all"}|${q}`} categoryId={selected} q={q} />
                </section>

                <aside className="drecipe-side" aria-labelledby="drecipe-recent">
                    <h2 id="drecipe-recent">최근 본 레시피</h2>
                    {recent.length === 0 ? (
                        <p className="drecipe-status">아직 본 레시피가 없어요.</p>
                    ) : (
                        <ul>
                            {recent.map((r) => (
                                <li key={r.id}>
                                    <Link to={`/recipe/${r.id}`}>
                                        <span className="drecipe-thumb">
                                            {r.image_url && <img src={r.image_url} alt="" loading="lazy" referrerPolicy="no-referrer" />}
                                        </span>
                                        <span>{r.title}</span>
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    )}
                </aside>
            </div>
        </div>
    );
};

export default RecipeList;
