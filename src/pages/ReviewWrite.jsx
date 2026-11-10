import { useRef, useState } from "react";
import { useNavigate } from "react-router";
import logo from "../assets/recipe/logo.png";
import recipeIcon from "../assets/lucide_recipe_icon.png";
import food from "../assets/review/food.png";
import stars from "../assets/review/stars.svg";
import dot from "../assets/review/dot.svg";
import camera from "../assets/review/camera.png";
import "../styles/review-write.css";

const tastes = ["맛있어요", "보통이예요", "생각보다 별로예요"];

// shortcut: 레시피 하나(콩나물국)만 있어 제목을 고정 → 레시피 데이터·리뷰 저장이 생기면 교체
const ReviewWrite = () => {
    const navigate = useNavigate();
    const [rating, setRating] = useState(5); // 디자인처럼 처음엔 별 5개
    const [taste, setTaste] = useState("");
    const [photo, setPhoto] = useState(""); // 미리보기용 임시 주소

    const [text, setText] = useState("");
    const textRef = useRef(null);

    // 저장된 리뷰가 없어 삭제 = 쓰던 내용을 처음 상태로 되돌림
    const remove = () => {
        if (!window.confirm("작성한 리뷰를 삭제할까요?")) return;
        if (photo) URL.revokeObjectURL(photo);
        setRating(5);
        setTaste("");
        setText("");
        setPhoto("");
    };

    const attach = (e) => {
        const file = e.target.files[0];
        if (photo) URL.revokeObjectURL(photo);
        setPhoto(file ? URL.createObjectURL(file) : "");
    };

    return (
        <div className="review-page">
            <header className="review-header">
                <button type="button" className="review-back" aria-label="뒤로가기" onClick={() => navigate(-1)}>
                    <svg viewBox="0 0 38 38" aria-hidden="true"><path d="M23 9 14.5 19 23 29" /></svg>
                </button>
                <img className="review-logo" src={logo} alt="" />
                <h1>리뷰 작성하기</h1>
            </header>

            <main className="review-main">
                <p className="review-recipe-name">맑은 콩나물국</p>

                <div className="review-photo">
                    <img src={food} alt="맑은 콩나물국 사진" />
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

                {/* 저장할 곳이 아직 없어 이전 페이지로만 돌아감 */}
                <div className="review-actions">
                    <button type="button" className="review-submit" onClick={() => navigate(-1)}>리뷰 작성 완료</button>
                    <button type="button" className="review-submit review-submit--sub" onClick={() => textRef.current.focus()}>편집</button>
                    <button type="button" className="review-submit review-submit--sub" onClick={remove}>삭제</button>
                </div>
            </main>
        </div>
    );
};

export default ReviewWrite;
