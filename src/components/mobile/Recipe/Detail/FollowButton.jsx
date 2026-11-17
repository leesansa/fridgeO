import { useNavigate } from "react-router";
import { useLoggedIn } from "../../../../hooks/useLoggedIn";
import { useSetFollow } from "../../../../queries/reviews";

// 작성자 이름 옆 팔로우 버튼 (모바일 DetailInfo·데스크탑 DetailSummary 공통). 작성자가 없거나 내 레시피면 안 보임
// 스타일은 styles/mobile/recipe-detail.css 의 .detail-follow
const FollowButton = ({ recipe }) => {
    const navigate = useNavigate();
    const loggedIn = useLoggedIn();
    const { mutate: setFollow, isPending: saving } = useSetFollow();
    const following = Boolean(recipe.following);

    // 작성자가 있고(초기 데이터·탈퇴 아님) 내 레시피가 아닐 때만 팔로우 버튼
    if (!recipe.author || recipe.mine) return null;

    // 레시피 캐시를 먼저 바꾸고 저장, 실패하면 되돌리고 alert. 로그인 안 했으면 로그인 화면으로
    const toggle = () => {
        if (!loggedIn) return navigate("/login");
        setFollow({ recipeId: recipe.id, on: !following }, { onError: (e) => alert(`팔로우를 바꾸지 못했어요. ${e.message}`) });
    };

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
