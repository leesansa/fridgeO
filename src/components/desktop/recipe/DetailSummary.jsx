import { useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router";
import { useRecipeBookmark } from "../../../utils/useRecipeBookmark";
import FollowButton from "../../mobile/Recipe/Detail/FollowButton.jsx";
import "../../../vendor/lucian-icons/edit.js"; // 079번 edit(연필) 아이콘
import "../../../vendor/lucian-icons/bookmark.js"; // 012번 bookmark 아이콘

// 데스크탑 레시피 상세 사진 옆: 분류·제목·작성자·요리 정보·소개글·별점 + 북마크/리뷰 작성/레시피 수정
// 레시피가 바뀌면 부모가 key 로 새로 만듦 (북마크 상태 초기화)
const DetailSummary = ({ recipe, categoryName }) => {
    const navigate = useNavigate();
    const { saved, saving, error, toggle } = useRecipeBookmark(recipe);
    // state 는 읽기 전용 프로퍼티라 React 가 넣으면 에러 → 속성으로 직접 지정 (모바일 DetailHero 와 같음)
    const bookmarkRef = useRef(null);
    useEffect(() => bookmarkRef.current?.setAttribute("state", saved ? "on" : "off"), [saved]);

    const tags = [
        recipe.cook_time && `${recipe.cook_time}분`,
        recipe.servings && `${recipe.servings}인분`,
        recipe.difficulty,
    ].filter(Boolean);

    return (
        <div className="detail-card ddetail-summary">
            {categoryName && (
                <Link to={`/recipe?category=${recipe.category_id}`} className="ddetail-category">{categoryName}</Link>
            )}
            <h1 className="detail-title">{recipe.title}</h1>
            <p className="detail-author">
                {recipe.author ?? "알 수 없음"}
                <FollowButton recipe={recipe} />
            </p>
            {tags.length > 0 && (
                <ul className="detail-tags" aria-label="요리 정보">
                    {tags.map((t) => <li key={t}>{t}</li>)}
                </ul>
            )}
            {recipe.description && <p className="detail-intro">{recipe.description}</p>}
            <p className="ddetail-rating">
                {recipe.review_count
                    ? <><span aria-hidden="true">★</span> {recipe.rating} · 리뷰 {recipe.review_count.toLocaleString()}개</>
                    : "아직 리뷰가 없어요"}
            </p>
            <div className="ddetail-actions">
                <button type="button" className="ddetail-action" aria-pressed={saved} disabled={saving} onClick={toggle}>
                    <lucian-bookmark size="20" tone="line" accent="#57852f" ref={bookmarkRef} aria-hidden="true" />
                    {saved ? "북마크됨" : "북마크"}
                </button>
                <button type="button" className="ddetail-action primary" onClick={() => navigate(`/recipe/${recipe.id}/review`)}>
                    <lucian-edit size="18" tone="line" aria-hidden="true" /> 리뷰 작성하기
                </button>
                {/* 내가 쓴 레시피일 때만 (서버가 로그인 계정과 작성자를 비교한 mine) */}
                {recipe.mine && (
                    <button type="button" className="ddetail-action" onClick={() => navigate(`/recipe/${recipe.id}/edit`)}>
                        레시피 수정
                    </button>
                )}
            </div>
            {error && <p className="detail-popup-note" role="alert">{error}</p>}
        </div>
    );
};

export default DetailSummary;
