import { useState } from "react";
import { useNavigate } from "react-router";
import { apiFetch, isLoggedIn } from "./auth";

// 레시피 북마크 (DB recipe_bookmarks). 모바일·데스크탑 상세가 같이 씀. 레시피가 바뀌면 부모가 key 로 새로 만듦
// 아이콘을 먼저 바꾸고 DB에 저장, 실패하면 되돌림. 로그인 안 했으면 로그인 화면으로
export function useRecipeBookmark(recipe) {
  const navigate = useNavigate();
  const [saved, setSaved] = useState(recipe.bookmarked); // 처음 값은 상세 응답 (로그인 안 했으면 false)
  const [saving, setSaving] = useState(false); // 저장 중 연타하면 요청 순서가 꼬이니 잠금
  const [error, setError] = useState("");

  const toggle = async () => {
    if (!(await isLoggedIn())) {
      navigate("/login");
      return;
    }
    const next = !saved;
    setSaved(next);
    setSaving(true);
    setError("");
    try {
      await apiFetch(`/api/recipes/${encodeURIComponent(recipe.id)}/bookmark`, { method: next ? "PUT" : "DELETE" });
    } catch (e) {
      setSaved(!next);
      setError(e.message);
    } finally {
      setSaving(false);
    }
  };

  return { saved, saving, error, toggle };
}
