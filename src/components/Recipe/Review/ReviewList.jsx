import { useCallback, useEffect, useState } from "react";
import { apiFetch } from "../../../utils/auth.js";

// 다른 사람들의 리뷰 (DB reviews). 5개씩, "리뷰 더보기"로 이어서. 레시피가 바뀌면 부모가 key 로 새로 만듦
const ReviewList = ({ recipeId, total }) => {
    const [reviews, setReviews] = useState([]);
    const [nextOffset, setNextOffset] = useState(null); // null = 끝 (또는 첫 페이지 전)
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    // offset 부터 5개를 받아 목록에 붙임. 첫 페이지는 덮어써서 개발 모드(StrictMode)에서 두 번 불려도 중복되지 않게
    const fetchPage = useCallback((offset) =>
        apiFetch(`/api/recipes/${encodeURIComponent(recipeId)}/reviews?offset=${offset}`)
            .then((data) => {
                setReviews((prev) => (offset === 0 ? data.items : [...prev, ...data.items]));
                setNextOffset(data.nextOffset);
                setError("");
            })
            .catch((e) => setError(e.message))
            .finally(() => setLoading(false)), [recipeId]);

    useEffect(() => { fetchPage(0); }, [fetchPage]);

    const loadMore = () => {
        setLoading(true);
        fetchPage(nextOffset);
    };

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
            {error && <p className="detail-popup-note" role="alert">{error}</p>}
            {nextOffset !== null && total > 0 && (
                <button type="button" className="detail-btn detail-btn--wide detail-btn--line" disabled={loading} onClick={loadMore}>
                    {loading ? "불러오는 중..." : "리뷰 더보기"}
                </button>
            )}
        </section>
    );
};

export default ReviewList;
