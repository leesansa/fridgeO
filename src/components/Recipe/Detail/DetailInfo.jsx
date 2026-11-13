import { useState } from "react";
import { useNavigate } from "react-router";
import { apiFetch, isLoggedIn } from "../../../utils/auth.js";

// 레시피 제목·작성자(+팔로우)·요리 정보(시간·인분·난이도) + 소개글
const DetailInfo = ({ recipe }) => {
    const navigate = useNavigate();
    const [following, setFollowing] = useState(recipe.following); // 처음 값은 상세 응답 (로그인 안 했으면 false)
    const [savingFollow, setSavingFollow] = useState(false); // 저장 중 연타하면 요청 순서가 꼬이니 잠금
    const tags = [
        recipe.cook_time && `${recipe.cook_time}분`,
        recipe.servings && `${recipe.servings}인분`,
        recipe.difficulty,
    ].filter(Boolean);

    // 북마크와 같은 방식: 아이콘을 먼저 바꾸고 DB(follows)에 저장, 실패하면 되돌림. 로그인 안 했으면 로그인 화면으로
    const toggleFollow = async () => {
        if (!(await isLoggedIn())) {
            navigate("/login");
            return;
        }
        const next = !following;
        setFollowing(next);
        setSavingFollow(true);
        try {
            await apiFetch(`/api/recipes/${encodeURIComponent(recipe.id)}/follow`, { method: next ? "PUT" : "DELETE" });
        } catch (e) {
            setFollowing(!next);
            alert(`팔로우를 바꾸지 못했어요. ${e.message}`);
        } finally {
            setSavingFollow(false);
        }
    };

    return (
        <>
            <section className="detail-card">
                <h1 className="detail-title">{recipe.title}</h1>
                <p className="detail-author">
                    {recipe.author ?? "알 수 없음"}
                    {/* 작성자가 있고(초기 데이터·탈퇴 아님) 내 레시피가 아닐 때만 */}
                    {recipe.author && !recipe.mine && (
                        <button
                            type="button"
                            className="detail-follow"
                            aria-label={`${recipe.author} 팔로우`}
                            aria-pressed={following}
                            title={following ? "팔로우 중 (누르면 해제)" : "팔로우"}
                            disabled={savingFollow}
                            onClick={toggleFollow}
                        >
                            {/* 사람 + 더하기(팔로우 전) / 체크(팔로우 중) */}
                            <svg viewBox="0 0 24 24" aria-hidden="true">
                                <circle cx="9" cy="7" r="4" />
                                <path d="M2 21v-2a4 4 0 0 1 4-4h6a4 4 0 0 1 4 4v2" />
                                <path d={following ? "m16 11 2 2 4-4" : "M19 8v6M22 11h-6"} />
                            </svg>
                        </button>
                    )}
                </p>
                {tags.length > 0 && (
                    <ul className="detail-tags" aria-label="요리 정보">
                        {tags.map((t) => <li key={t}>{t}</li>)}
                    </ul>
                )}
            </section>

            {recipe.description && (
                <section className="detail-card">
                    <p className="detail-intro">{recipe.description}</p>
                </section>
            )}
        </>
    );
};

export default DetailInfo;
