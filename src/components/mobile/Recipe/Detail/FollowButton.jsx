import { useAuthorFollow } from "../../../../hooks/useAuthorFollow.js";

// 작성자 이름 옆 팔로우 버튼 (모바일 DetailInfo·데스크탑 DetailSummary 공통). 작성자가 없거나 내 레시피면 안 보임
// 스타일은 styles/mobile/recipe-detail.css 의 .detail-follow
const FollowButton = ({ recipe }) => {
    const { canFollow, following, saving, toggle } = useAuthorFollow(recipe);
    if (!canFollow) return null;

    return (
        <button
            type="button"
            className="detail-follow"
            aria-label={`${recipe.author} 팔로우`}
            aria-pressed={following}
            title={following ? "팔로우 중 (누르면 해제)" : "팔로우"}
            disabled={saving}
            onClick={toggle}
        >
            {/* 사람 + 더하기(팔로우 전) / 체크(팔로우 중) */}
            <svg viewBox="0 0 24 24" aria-hidden="true">
                <circle cx="9" cy="7" r="4" />
                <path d="M2 21v-2a4 4 0 0 1 4-4h6a4 4 0 0 1 4 4v2" />
                <path d={following ? "m16 11 2 2 4-4" : "M19 8v6M22 11h-6"} />
            </svg>
        </button>
    );
};

export default FollowButton;
