import { useEffect, useRef } from "react";
import { useNavigate } from "react-router";
import { useRecipeBookmark } from "../../../../hooks/useRecipeBookmark.js";
import "../../../../vendor/lucian-icons/edit.js"; // 079번 edit(연필) 아이콘
import "../../../../vendor/lucian-icons/bookmark.js"; // 012번 bookmark 아이콘

// 레시피 상세 맨 위: 완성 사진 + 북마크(DB recipe_bookmarks, useRecipeBookmark) + 리뷰 작성하기
// 사진이 없어도 북마크·리뷰 작성 버튼은 보이게 칸은 항상 그림
const DetailHero = ({ recipe }) => {
    const navigate = useNavigate();
    const { saved, saving, error, toggle } = useRecipeBookmark(recipe);
    // React 가 state 를 속성이 아닌 프로퍼티로 넣으면 getter 만 있어 에러가 나므로 속성으로 직접 지정
    const bookmarkRef = useRef(null);
    useEffect(() => bookmarkRef.current?.setAttribute("state", saved ? "on" : "off"), [saved]);

    return (
        <section className="detail-card detail-hero">
            {recipe.image_url && <img src={recipe.image_url} alt={`${recipe.title} 완성 사진`} referrerPolicy="no-referrer" />}
            <div className="detail-hero-actions">
                <button type="button" className="detail-bookmark" aria-label="북마크" aria-pressed={saved} disabled={saving} onClick={toggle}>
                    <lucian-bookmark size="30" tone="line" accent="#57852f" ref={bookmarkRef} aria-hidden="true" />
                </button>
                <button type="button" className="detail-btn" onClick={() => navigate(`/recipe/${recipe.id}/review`)}>
                    <lucian-edit size="16" tone="line" aria-hidden="true" /> 리뷰 작성하기
                </button>
                {/* 내가 쓴 레시피일 때만 (서버가 로그인 계정과 작성자를 비교한 mine) */}
                {recipe.mine && (
                    <button type="button" className="detail-btn" onClick={() => navigate(`/recipe/${recipe.id}/edit`)}>
                        레시피 수정
                    </button>
                )}
            </div>
            {error && <p className="detail-popup-note detail-bookmark-error" role="alert">{error}</p>}
        </section>
    );
};

export default DetailHero;
