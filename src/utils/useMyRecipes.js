import { useEffect, useState } from "react";
import { apiFetch } from "./auth";

// 내가 쓴 레시피 (GET /api/me/recipes) + 삭제. 모바일·데스크탑 마이페이지가 같이 씀. 작성자 확인은 서버가 로그인 계정으로 함
export function useMyRecipes() {
  const [recipes, setRecipes] = useState(null); // 불러오기 전 null
  const [error, setError] = useState("");
  const [deleting, setDeleting] = useState(null); // 지우는 중인 레시피 id (두 번 눌러도 한 번만)

  useEffect(() => {
    apiFetch("/api/me/recipes").then(setRecipes).catch((e) => setError(e.message));
  }, []);

  const remove = async (recipe) => {
    if (!window.confirm(`"${recipe.title}" 레시피를 삭제할까요? 리뷰와 북마크도 함께 지워지고 되돌릴 수 없어요.`)) return;
    setDeleting(recipe.id);
    setError("");
    try {
      await apiFetch(`/api/recipes/${recipe.id}`, { method: "DELETE" });
      setRecipes((list) => list.filter((r) => r.id !== recipe.id));
    } catch (e) {
      setError(e.message);
    } finally {
      setDeleting(null);
    }
  };

  return { recipes, error, deleting, remove };
}
