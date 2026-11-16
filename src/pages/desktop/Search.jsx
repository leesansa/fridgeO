import { useState } from "react";
import { Link, useSearchParams } from "react-router";
import RecipeCard from "../../components/desktop/recipe/RecipeCard";
import Highlight from "../../components/desktop/Highlight";
import { useUnifiedSearch } from "../../utils/useUnifiedSearch";
import { getDaysLeft, getExpiryBadge, getTodayKey } from "../../utils/fridgeUtils";
import searchIcon from "../../assets/main/search.png";
import "../../styles/desktop/recipes.css"; // 레시피 카드
import "../../styles/desktop/search.css";

// 데스크탑 통합 검색 (?q=): 큰 검색창 | 왼쪽 내 냉장고 재료(로그인 시, 전체 개수) · 오른쪽 레시피 카드 격자. 검색어는 표시
// 찾기는 모바일과 같은 useUnifiedSearch (각 목록 첫 페이지만, 더 보기는 냉장고·레시피 목록으로)
const Search = () => {
    const [searchParams, setSearchParams] = useSearchParams();
    const q = searchParams.get("q")?.trim() ?? "";
    const { loading, result } = useUnifiedSearch(q);
    const [today] = useState(getTodayKey);
    const done = q && !loading && !result.error;
    const recipes = done ? result.recipes : null;
    const ingredients = done ? result.ingredients : null;

    return (
        <div className="dsearch">
            <form
                className="dsearch-bar"
                role="search"
                onSubmit={(e) => {
                    e.preventDefault();
                    const next = String(new FormData(e.currentTarget).get("q") ?? "").trim();
                    setSearchParams(next ? { q: next } : {});
                }}
            >
                <img src={searchIcon} alt="" />
                {/* 주소의 검색어가 바뀌면(헤더 검색 등) 입력칸도 새로 채움 */}
                <input key={q} name="q" type="search" defaultValue={q} maxLength={50} placeholder="레시피나 재료를 검색해보세요" aria-label="레시피나 재료 검색" />
                <button type="submit">검색</button>
            </form>

            {!q ? (
                <p className="dsearch-status">레시피 제목이나 재료 이름으로 찾아보세요. 로그인하면 내 냉장고 재료도 함께 찾아요.</p>
            ) : loading ? (
                <p className="dsearch-status" role="status">'{q}' 찾는 중…</p>
            ) : result.error ? (
                <p className="dsearch-status" role="alert">검색하지 못했어요. {result.error}</p>
            ) : (
                <>
                    <h1 className="dsearch-title">
                        <span className="dsearch-q">'<em>{q}</em>' 검색 결과</span>
                        <span className="dsearch-counts">
                            레시피 {recipes.items.length}{recipes.nextCursor != null ? "개+" : "개"}
                            {ingredients && ` · 내 재료 ${ingredients.total ?? ingredients.items.length}개`}
                        </span>
                    </h1>

                    <div className="dsearch-layout">
                        <section className="dsearch-side" aria-labelledby="dsearch-ing-title">
                            <h2 id="dsearch-ing-title">내 냉장고 재료 {ingredients && <span>{ingredients.total ?? ingredients.items.length}</span>}</h2>
                            {!ingredients ? (
                                <p className="dsearch-empty">
                                    로그인하면 내 냉장고 재료도 함께 찾아요. <Link to="/login">로그인 ›</Link>
                                </p>
                            ) : ingredients.items.length === 0 ? (
                                <p className="dsearch-empty">'{q}' 재료가 냉장고에 없어요.</p>
                            ) : (
                                <ul className="dsearch-ings">
                                    {ingredients.items.map((item) => {
                                        const badge = getExpiryBadge(item.expiry_date, today);
                                        const expired = item.expiry_date && getDaysLeft(item.expiry_date, today) < 0;
                                        return (
                                            <li key={item.id}>
                                                <Link to={`/ingredient/edit/${item.id}`}>
                                                    <span className="dsearch-photo" aria-hidden="true">
                                                        {item.image_url ? <img src={item.image_url} alt="" referrerPolicy="no-referrer" /> : (item.name ?? "?")[0]}
                                                    </span>
                                                    <span className="dsearch-ing-text">
                                                        <strong><Highlight text={item.name ?? "이름 없음"} word={q} /></strong>
                                                        <small>{item.quantity} {item.unit} · {item.storage}</small>
                                                    </span>
                                                    <span className={`dsearch-badge ${Number(item.quantity) === 0 ? "is-empty" : expired ? "is-expired" : badge.className}`}>
                                                        {Number(item.quantity) === 0 ? "다 떨어짐" : badge.label}
                                                    </span>
                                                </Link>
                                            </li>
                                        );
                                    })}
                                </ul>
                            )}
                            {ingredients && ingredients.nextOffset != null && (
                                <Link to={`/fridge?${new URLSearchParams({ q })}`} className="dsearch-more">냉장고에서 더 보기 ›</Link>
                            )}
                        </section>

                        <section aria-labelledby="dsearch-recipe-title">
                            <div className="dsearch-section-head">
                                <h2 id="dsearch-recipe-title">레시피</h2>
                                {recipes.nextCursor != null && (
                                    <Link to={`/recipe?${new URLSearchParams({ q })}`} className="dsearch-more">레시피 더 보기 ›</Link>
                                )}
                            </div>
                            {recipes.items.length === 0 ? (
                                <p className="dsearch-empty">'{q}'에 맞는 레시피가 없어요.</p>
                            ) : (
                                <ul className="drecipe-grid">
                                    {recipes.items.map((r) => <li key={r.id}><RecipeCard recipe={r} highlight={q} /></li>)}
                                </ul>
                            )}
                        </section>
                    </div>
                </>
            )}
        </div>
    );
};

export default Search;
