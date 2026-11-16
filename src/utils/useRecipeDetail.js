import { useEffect, useState } from "react";
import { apiFetch } from "./auth";
import { addRecentRecipe } from "./recentRecipes";

// 레시피 상세 (GET /api/recipes/:id: 기본 정보·재료·recipe_steps). 모바일·데스크탑 상세가 같이 씀
// 응답을 어느 id 것인지와 함께 보관 → 주소의 id 가 바뀌면 자동으로 "불러오는 중"(recipe null)
export function useRecipeDetail(id) {
  const [loaded, setLoaded] = useState({ id: null, recipe: null, error: "" });

  useEffect(() => {
    let ignore = false; // 다른 레시피로 바로 옮겨 가면 늦게 온 이전 응답은 버림
    apiFetch(`/api/recipes/${encodeURIComponent(id)}`)
      .then((data) => {
        if (ignore) return;
        setLoaded({ id, recipe: data, error: "" });
        addRecentRecipe(data); // "최근 본 레시피"에 기록
      })
      .catch((e) => !ignore && setLoaded({ id, recipe: null, error: e.message }));
    return () => { ignore = true; };
  }, [id]);

  return {
    recipe: loaded.id === id ? loaded.recipe : null,
    error: loaded.id === id ? loaded.error : "",
  };
}
