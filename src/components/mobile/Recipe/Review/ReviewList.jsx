import { useReviewPages } from "../../../../queries/reviews";

// 다른 사람들의 리뷰 (DB reviews). 5개씩, "리뷰 더보기"로 이어서 (queries/reviews 의 useReviewPages)
const ReviewList = ({ recipeId, total }) => {
    const list = useReviewPages(recipeId);
    const reviews = list.data?.items ?? [];
    const loading = list.isFetching;

    return (
        <section className="detail-card" aria-label="리뷰">
            <h2>리뷰 <span className="detail-review-count">{total.toLocaleString()}</span></h2>
            {total === 0 && <p className="detail-review-empty">아직 리뷰가 없어요. 첫 리뷰를 남겨 주세요!</p>}
            <ul className="detail-review-list">
                {reviews.map((r) => (
                    <li key={r.id} className="detail-review-item">
                        {r.profile_image_url
                            ? <img className="detail-review-avatar" src={r.profile_image_url} alt="" loading="lazy" />
                            : <span className="detail-review-avatar" aria-hidden="true" />}
                        <div className="detail-review-body">
                            <div className="detail-review-meta">
                                <strong>{r.author ?? "탈퇴한 사용자"}</strong>
                                <time dateTime={r.created_at}>{new Date(r.created_at).toLocaleDateString("ko-KR")}</time>
                            </div>
                            <span className="detail-review-stars" role="img" aria-label={`별점 ${r.rating}점`}>
                                {"★".repeat(r.rating)}<span className="off">{"★".repeat(5 - r.rating)}</span>
                            </span>
                            {r.comment && <p className="detail-review-text">{r.comment}</p>}
                        </div>
                    </li>
                ))}
            </ul>
            {list.isError && <p className="detail-popup-note" role="alert">{list.error.message}</p>}
            {list.hasNextPage && total > 0 && (
                <button type="button" className="detail-btn detail-btn--wide detail-btn--line" disabled={loading} onClick={() => list.fetchNextPage()}>
                    {loading ? "불러오는 중..." : "리뷰 더보기"}
                </button>
            )}
        </section>
    );
};

export default ReviewList;
