import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router";
import { apiFetch, isLoggedIn } from "../../utils/auth.js";
import "../../vendor/lucian-icons/edit.js"; // 079번 edit(연필) 아이콘
import "../../vendor/lucian-icons/bookmark.js"; // 012번 bookmark 아이콘

// 레시피 상세 맨 위: 완성 사진 + 북마크(DB recipe_bookmarks) + 리뷰 작성하기
// 사진이 없어도 북마크·리뷰 작성 버튼은 보이게 칸은 항상 그림
const DetailHero = ({ recipe }) => {
    const navigate = useNavigate();
    const [saved, setSaved] = useState(recipe.bookmarked); // 처음 값은 상세 응답 (로그인 안 했으면 false)
    const [savingMark, setSavingMark] = useState(false); // 저장 중 연타하면 요청 순서가 꼬이니 잠금
    const [markError, setMarkError] = useState("");
    // React 가 state 를 속성이 아닌 프로퍼티로 넣으면 getter 만 있어 에러가 나므로 속성으로 직접 지정
    const bookmarkRef = useRef(null);
    useEffect(() => bookmarkRef.current?.setAttribute("state", saved ? "on" : "off"), [saved]);

    // 아이콘을 먼저 바꾸고 DB에 저장, 실패하면 되돌림. 로그인 안 했으면 로그인 화면으로
    const toggleBookmark = async () => {
        if (!(await isLoggedIn())) {
            navigate("/login");
            return;
        }
        const next = !saved;
        setSaved(next);
        setSavingMark(true);
        setMarkError("");
        try {
            await apiFetch(`/api/recipes/${encodeURIComponent(recipe.id)}/bookmark`, { method: next ? "PUT" : "DELETE" });
        } catch (e) {
            setSaved(!next);
            setMarkError(e.message);
        } finally {
            setSavingMark(false);
        }
    };

    return (
        <section className="detail-card detail-hero">
            {recipe.image_url && <img src={recipe.image_url} alt={`${recipe.title} 완성 사진`} referrerPolicy="no-referrer" />}
            <div className="detail-hero-actions">
                <button type="button" className="detail-bookmark" aria-label="북마크" aria-pressed={saved} disabled={savingMark} onClick={toggleBookmark}>
                    <lucian-bookmark size="30" tone="line" accent="#57852f" ref={bookmarkRef} aria-hidden="true" />
                </button>
                <button type="button" className="detail-btn" onClick={() => navigate(`/recipe/${recipe.id}/review`)}>
                    <lucian-edit size="16" tone="line" aria-hidden="true" /> 리뷰 작성하기
                </button>
            </div>
            {markError && <p className="detail-popup-note detail-bookmark-error" role="alert">{markError}</p>}
        </section>
    );
};

export default DetailHero;
