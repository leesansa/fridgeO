import { Link, useNavigate, useParams } from "react-router";
import camera from "../../assets/review/camera.png";
import { TASTES, useReviewForm } from "../../utils/useReviewForm";
import "../../styles/desktop/review-write.css";

const RATING_WORDS = ["별로예요", "그저 그래요", "괜찮아요", "좋아요", "최고예요"];
const MAX_TEXT = 1000; // 서버 PUT 검사와 같음

// 데스크탑 리뷰 작성: 왼쪽 레시피 카드 | 오른쪽 평가 양식. 불러오기·저장·삭제는 모바일과 같은 useReviewForm
const ReviewWrite = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { recipe, mine, rating, setRating, taste, setTaste, text, setText, error, saving, photo, attach, save, remove } = useReviewForm(id);

    return (
        <div className="dreview">
            <nav className="dreview-crumbs" aria-label="현재 위치">
                <Link to="/recipe">레시피</Link> › <Link to={`/recipe/${id}`}>{recipe?.title ?? "레시피"}</Link> ›{" "}
                <span aria-current="page">{mine ? "리뷰 수정" : "리뷰 작성"}</span>
            </nav>

            <div className="dreview-layout">
                <aside className="dreview-recipe">
                    <div className="dreview-photo">
                        {recipe?.image_url && <img src={recipe.image_url} alt={`${recipe.title} 사진`} referrerPolicy="no-referrer" />}
                    </div>
                    <div className="dreview-recipe-body">
                        <h2>{recipe?.title ?? (error ? "레시피" : "레시피를 불러오는 중...")}</h2>
                        {recipe && (
                            <>
                                <p className="dreview-author">{recipe.author ?? "알 수 없음"}</p>
                                <p className="dreview-score">
                                    {recipe.review_count
                                        ? <><span aria-hidden="true">★</span> {recipe.rating} · 리뷰 {recipe.review_count.toLocaleString()}개</>
                                        : "아직 리뷰가 없어요. 첫 리뷰를 남겨 주세요!"}
                                </p>
                            </>
                        )}
                        <Link to={`/recipe/${id}`} className="dreview-back">‹ 레시피로 돌아가기</Link>
                    </div>
                </aside>

                <form
                    className="dreview-form"
                    onSubmit={(e) => {
                        e.preventDefault();
                        save();
                    }}
                >
                    <h1>{mine ? "리뷰 수정하기" : "리뷰 작성하기"}</h1>

                    <fieldset className="dreview-field">
                        <legend>이 레시피에 얼마나 만족하시나요?</legend>
                        <div className="dreview-stars">
                            {[1, 2, 3, 4, 5].map((n) => (
                                <label key={n} className={n <= rating ? "is-on" : undefined}>
                                    <input type="radio" name="rating" checked={rating === n} onChange={() => setRating(n)} />
                                    <span aria-hidden="true">★</span>
                                    <span className="dreview-sr">{n}점 {RATING_WORDS[n - 1]}</span>
                                </label>
                            ))}
                            <span className="dreview-stars-word" aria-hidden="true">{rating}점 · {RATING_WORDS[rating - 1]}</span>
                        </div>
                    </fieldset>

                    <fieldset className="dreview-field">
                        <legend>직접 드셔보니 맛은 어땠나요?</legend>
                        <div className="dreview-chips">
                            {TASTES.map((t) => (
                                <label key={t} className={taste === t ? "is-on" : undefined}>
                                    <input type="radio" name="taste" checked={taste === t} onChange={() => setTaste(t)} />
                                    {t}
                                </label>
                            ))}
                        </div>
                    </fieldset>

                    <div className="dreview-field">
                        <label htmlFor="dreview-text" className="dreview-label">이 레시피에 대해 상세히 평가해주세요</label>
                        <textarea
                            id="dreview-text"
                            value={text}
                            maxLength={MAX_TEXT}
                            onChange={(e) => setText(e.target.value)}
                            placeholder="다른 분들에게 도움이 되도록 레시피에 대한 솔직한 평가를 남겨주세요"
                        />
                        <div className="dreview-text-foot">
                            <label className="dreview-attach">
                                <img src={camera} alt="" />
                                사진 첨부하기
                                <input type="file" accept="image/*" hidden onChange={attach} />
                            </label>
                            <span className="dreview-count">{text.length} / {MAX_TEXT}</span>
                        </div>
                        {photo && <img className="dreview-attached" src={photo} alt="첨부한 사진 미리보기" />}
                    </div>

                    {error && <p className="dreview-error" role="alert">{error}</p>}

                    <div className="dreview-actions">
                        <button type="button" className="dreview-btn danger" onClick={remove}>
                            {mine ? "리뷰 삭제" : "내용 지우기"}
                        </button>
                        <button type="button" className="dreview-btn" onClick={() => navigate(`/recipe/${id}`)}>취소</button>
                        <button type="submit" className="dreview-btn primary" disabled={!recipe || saving}>
                            {saving ? "저장 중..." : mine ? "리뷰 수정 완료" : "리뷰 작성 완료"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ReviewWrite;
