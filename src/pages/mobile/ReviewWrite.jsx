import { useRef } from "react";
import { Link, useNavigate, useParams } from "react-router";
import logo from "../../assets/recipe/logo.png";
import recipeIcon from "../../assets/lucide_recipe_icon.png";
import stars from "../../assets/review/stars.svg";
import dot from "../../assets/review/dot.svg";
import camera from "../../assets/review/camera.png";
import { TASTES as tastes, useReviewForm } from "../../hooks/useReviewForm.js";
import "../../styles/mobile/review-write.css";

// /recipe/:id/review — 이 레시피에 대한 내 리뷰를 DB(reviews)에 작성·수정·삭제 (로그인은 router 에서 확인)
const ReviewWrite = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    // 불러오기·저장·삭제·사진 미리보기는 데스크탑과 공통 (useReviewForm)
    const { recipe, mine, rating, setRating, taste, setTaste, text, setText, error, saving, photo, attach, save, remove } = useReviewForm(id);
    const textRef = useRef(null);

    return (
        <div className="review-page">
            <header className="review-header">
                <button type="button" className="review-back" aria-label="뒤로가기" onClick={() => navigate(-1)}>
                    <svg viewBox="0 0 38 38" aria-hidden="true"><path d="M23 9 14.5 19 23 29" /></svg>
                </button>
                <Link to="/" className="review-logo" aria-label="홈으로"><img src={logo} alt="" /></Link>
                <h1>{mine ? "리뷰 수정하기" : "리뷰 작성하기"}</h1>
            </header>

            <main className="review-main">
                <p className="review-recipe-name">{recipe?.title ?? (error ? "" : "레시피를 불러오는 중...")}</p>

                <div className="review-photo">
                    {recipe?.image_url && <img src={recipe.image_url} alt={`${recipe.title} 사진`} referrerPolicy="no-referrer" />}
                </div>

                <section className="review-rate" aria-label="레시피 평가">
                    <div className="review-rate-head">
                        <img src={recipeIcon} alt="" />
                        <h2>레시피 평가</h2>
                        <div className="review-stars" role="radiogroup" aria-label="별점">
                            <img className="review-stars-off" src={stars} alt="" />
                            <div className="review-stars-on" style={{ width: `${rating * 20}%` }}><img src={stars} alt="" /></div>
                            {[1, 2, 3, 4, 5].map((n) => (
                                <label key={n} style={{ left: `${(n - 1) * 20}%` }}>
                                    <input type="radio" name="rating" aria-label={`${n}점`} checked={rating === n} onChange={() => setRating(n)} />
                                </label>
                            ))}
                        </div>
                    </div>
                    <p className="review-q">이 레시피에 대해 얼마나 만족하시나요</p>

                    <fieldset className="review-taste">
                        <legend><img src={logo} alt="" />직접 드셔보니 맛은 어떴나요?</legend>
                        {tastes.map((t) => (
                            <label key={t}>
                                <input type="radio" name="taste" checked={taste === t} onChange={() => setTaste(t)} />
                                <img src={dot} alt="" />
                                {t}
                            </label>
                        ))}
                    </fieldset>
                </section>

                <section className="review-detail">
                    <h2>이 레시피에 대해 상세히 평가해주세요</h2>
                    <div className="review-box">
                        <textarea
                            ref={textRef}
                            value={text}
                            maxLength={1000}
                            onChange={(e) => setText(e.target.value)}
                            aria-label="상세 리뷰"
                            placeholder="다른 고객님에게 도움이 되도록 레시피에 대한 솔직한 평가를 남겨주세요"
                        />
                        <label className="review-attach">
                            <img src={camera} alt="" />
                            첨부하기
                            <input type="file" accept="image/*" hidden onChange={attach} />
                        </label>
                    </div>
                    {photo && <img className="review-attached" src={photo} alt="첨부한 사진" />}
                </section>

                {error && <p className="review-error" role="alert">{error}</p>}

                <div className="review-actions">
                    <button type="button" className="review-submit" disabled={!recipe || saving} onClick={save}>
                        {saving ? "저장 중..." : mine ? "리뷰 수정 완료" : "리뷰 작성 완료"}
                    </button>
                    <button type="button" className="review-submit review-submit--sub" onClick={() => textRef.current.focus()}>편집</button>
                    <button type="button" className="review-submit review-submit--sub" onClick={remove}>삭제</button>
                </div>
            </main>
        </div>
    );
};

export default ReviewWrite;
