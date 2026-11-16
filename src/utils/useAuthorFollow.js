import { useState } from "react";
import { useNavigate } from "react-router";
import { apiFetch, isLoggedIn } from "./auth";

// 레시피 작성자 팔로우 (DB follows). 모바일 DetailInfo·데스크탑 DetailSummary 가 같이 씀. 레시피가 바뀌면 부모가 key 로 새로 만듦
// 북마크와 같은 방식: 아이콘을 먼저 바꾸고 저장, 실패하면 되돌림. 로그인 안 했으면 로그인 화면으로
export function useAuthorFollow(recipe) {
  const navigate = useNavigate();
  const [following, setFollowing] = useState(recipe.following); // 처음 값은 상세 응답 (로그인 안 했으면 false)
  const [saving, setSaving] = useState(false); // 저장 중 연타하면 요청 순서가 꼬이니 잠금

  const toggle = async () => {
    if (!(await isLoggedIn())) {
      navigate("/login");
      return;
    }
    const next = !following;
    setFollowing(next);
    setSaving(true);
    try {
      await apiFetch(`/api/recipes/${encodeURIComponent(recipe.id)}/follow`, { method: next ? "PUT" : "DELETE" });
    } catch (e) {
      setFollowing(!next);
      alert(`팔로우를 바꾸지 못했어요. ${e.message}`);
    } finally {
      setSaving(false);
    }
  };

  // 작성자가 있고(초기 데이터·탈퇴 아님) 내 레시피가 아닐 때만 팔로우 버튼
  return { canFollow: Boolean(recipe.author) && !recipe.mine, following, saving, toggle };
}
