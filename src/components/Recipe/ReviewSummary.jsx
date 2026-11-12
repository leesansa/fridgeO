// 리뷰 요약: 리뷰 수 · 평균 별점 · 긍정 리뷰(별 4개 이상) 비율. 리뷰가 없으면 안 보임
const ReviewSummary = ({ recipe }) => {
    if (!recipe.review_count) return null;
    const positive = Math.round((recipe.positive_count / recipe.review_count) * 100);

    return (
        <section className="detail-card detail-review" aria-label="리뷰 요약">
            <span className="detail-review-badge">리뷰 요약</span>
            <p>리뷰 {recipe.review_count.toLocaleString()}개 · 평균 별점 {recipe.rating}점</p>
            <div className="detail-positive">
                <span>긍정리뷰 {positive}%</span>
                <span className="detail-positive-bar" aria-hidden="true"><span style={{ width: `${positive}%` }} /></span>
            </div>
        </section>
    );
};

export default ReviewSummary;
