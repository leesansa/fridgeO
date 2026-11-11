import { useEffect, useState } from "react";
import { useParams } from "react-router";
import Header from "../components/Header.jsx";
import { apiFetch } from "../utils/auth.js";
import { fridgeIngredients } from "../utils/fridgeData";
import "../vendor/lucian-icons/check.js"; // 065번 check 아이콘
import "../styles/recipe-detail.css";

// 냉장고에 있는 재료 이름 (공백 뺀 이름으로 비교, 예: "소 금" = "소금")
const norm = (name) => name.replace(/\s/g, "");
const inFridge = new Set(fridgeIngredients.map((f) => norm(f.name)));
const coupangUrl = (name) => `https://www.coupang.com/np/search?q=${encodeURIComponent(name)}`;

// 주소의 :id 로 DB 레시피(기본 정보·재료·recipe_steps)를 불러와 보여줌
const RecipeDetail = () => {
    const { id } = useParams();
    // 응답을 어느 id 것인지와 함께 보관 → 주소의 id 가 바뀌면 자동으로 "불러오는 중"
    const [loaded, setLoaded] = useState({ id: null, recipe: null, error: "" });
    const recipe = loaded.id === id ? loaded.recipe : null;
    const error = loaded.id === id ? loaded.error : "";
    // 체크 = 이미 갖고 있음. 처음엔 냉장고 재료로 채우고, 눌러서 바꿀 수 있음
    const [checked, setChecked] = useState(() => new Set());

    useEffect(() => {
        let ignore = false; // 다른 레시피로 바로 옮겨 가면 늦게 온 이전 응답은 버림
        apiFetch(`/api/recipes/${encodeURIComponent(id)}`)
            .then((data) => {
                if (ignore) return;
                setLoaded({ id, recipe: data, error: "" });
                setChecked(new Set(data.ingredients.filter((ing) => inFridge.has(norm(ing.name))).map((ing) => ing.name)));
            })
            .catch((e) => !ignore && setLoaded({ id, recipe: null, error: e.message }));
        return () => { ignore = true; };
    }, [id]);

    // 재료마다 쿠팡 검색 탭을 하나씩 연다. 브라우저가 한 번 클릭에 여러 탭을 막으면 막힌 개수를 알려 줌
    const [blocked, setBlocked] = useState(0);
    const openCoupangTabs = (items) => {
        const failed = items.filter((ing) => {
            const tab = window.open(coupangUrl(ing.name), "_blank"); // "noopener" 를 주면 항상 null 이라 막힘 여부를 알 수 없음
            if (tab) tab.opener = null; // 열린 쿠팡 페이지가 이 페이지를 건드리지 못하게
            return !tab;
        });
        setBlocked(failed.length);
    };

    const toggle = (name) => setChecked((prev) => {
        const next = new Set(prev);
        if (!next.delete(name)) next.add(name);
        return next;
    });

    if (!recipe) {
        return (
            <div className="detail-page">
                <Header />
                <main className="detail-main">
                    <section className="detail-card">
                        <p className="detail-intro" role={error ? "alert" : "status"}>{error || "레시피를 불러오는 중..."}</p>
                    </section>
                </main>
            </div>
        );
    }

    const { ingredients, steps } = recipe;
    const missing = ingredients.filter((ing) => !checked.has(ing.name));
    const haveCount = ingredients.length - missing.length;
    const tags = [
        recipe.cook_time && `${recipe.cook_time}분`,
        recipe.servings && `${recipe.servings}인분`,
        recipe.difficulty,
    ].filter(Boolean);
    const positive = recipe.review_count ? Math.round((recipe.positive_count / recipe.review_count) * 100) : 0;

    return (
        <div className="detail-page">
            <Header />

            <main className="detail-main">
                {recipe.image_url && (
                    <section className="detail-card detail-hero">
                        <img src={recipe.image_url} alt={`${recipe.title} 완성 사진`} referrerPolicy="no-referrer" />
                    </section>
                )}

                <section className="detail-card">
                    <h1 className="detail-title">{recipe.title}</h1>
                    <p className="detail-author">{recipe.author ?? "알 수 없음"}</p>
                    {tags.length > 0 && (
                        <ul className="detail-tags" aria-label="요리 정보">
                            {tags.map((t) => <li key={t}>{t}</li>)}
                        </ul>
                    )}
                </section>

                {recipe.description && (
                    <section className="detail-card">
                        <p className="detail-intro">{recipe.description}</p>
                    </section>
                )}

                {ingredients.length > 0 && (
                    <section className="detail-card" aria-label="준비물">
                        <div className="detail-ing-head">
                            <h2>준비물</h2>
                            <span className="detail-have">{haveCount}/{ingredients.length}개 준비됐어요</span>
                        </div>
                        <ul className="detail-ing-list">
                            {ingredients.map((ing) => {
                                const have = checked.has(ing.name);
                                return (
                                    <li key={ing.name} className={`detail-ing ${have ? "have" : "lack"}`}>
                                        <label className="detail-ing-label">
                                            <input type="checkbox" className="detail-check" checked={have} onChange={() => toggle(ing.name)} />
                                            <span className="detail-ing-mark" aria-hidden="true">{have && <lucian-check size="26" />}</span>
                                            <span className="detail-ing-name">{ing.name}</span>
                                            <span className="detail-ing-amount">{ing.amount}</span>
                                        </label>
                                        {/* 이미 있는 재료는 담을 필요가 없어 버튼을 숨김 */}
                                        {have
                                            ? <span className="detail-ing-spacer" />
                                            : <a className="detail-btn detail-ing-btn" href={coupangUrl(ing.name)} target="_blank" rel="noopener noreferrer" aria-label={`${ing.name} 쿠팡에서 찾기 (새 탭)`}>담기</a>}
                                    </li>
                                );
                            })}
                        </ul>
                        {missing.length > 0 && (
                            // shortcut: 쿠팡은 여러 상품을 한 번에 담는 주소가 없어 재료마다 검색 결과 탭을 열어 줌, 쿠팡 파트너스 API 를 쓰게 되면 교체
                            <button type="button" className="detail-btn detail-btn--wide" onClick={() => openCoupangTabs(missing)}>
                                없는 재료 {missing.length}개 장바구니에 담기
                            </button>
                        )}
                        {blocked > 0 && (
                            <p className="detail-popup-note" role="alert">
                                팝업 차단으로 {blocked}개 탭이 열리지 않았어요. 주소창의 팝업 차단 아이콘에서 이 사이트를 허용한 뒤 다시 눌러 주세요.
                            </p>
                        )}
                    </section>
                )}

                <section className="detail-card" aria-label="만드는 순서">
                    <h2>만드는 순서</h2>
                    <ol className="detail-steps">
                        {steps.map((step) => (
                            <li key={step.position} className="detail-step">
                                <div className="detail-step-photo">
                                    {step.image_url && <img src={step.image_url} alt={`${step.position}단계 사진`} loading="lazy" referrerPolicy="no-referrer" />}
                                    <span className="detail-step-no" aria-hidden="true">{step.position}</span>
                                </div>
                                <p>{step.text}</p>
                            </li>
                        ))}
                    </ol>
                </section>

                {recipe.review_count > 0 && (
                    <section className="detail-card detail-review" aria-label="리뷰 요약">
                        <span className="detail-review-badge">리뷰 요약</span>
                        <p>리뷰 {recipe.review_count.toLocaleString()}개 · 평균 별점 {recipe.rating}점</p>
                        <div className="detail-positive">
                            <span>긍정리뷰 {positive}%</span>
                            <span className="detail-positive-bar" aria-hidden="true"><span style={{ width: `${positive}%` }} /></span>
                        </div>
                    </section>
                )}
            </main>
        </div>
    );
};

export default RecipeDetail;
