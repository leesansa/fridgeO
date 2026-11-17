import { useEffect, useState } from "react";
import { authClient } from "../utils/auth";
import { getIngredients } from "../api/ingredients";
import { getRecipes } from "../api/recipes";

// 통합 검색 (모바일·데스크탑 공통): 레시피(제목·재료 이름) + 내 냉장고 재료(로그인 시)를 한 번에. 각 목록은 첫 페이지만
// result = { q, recipes, ingredients(로그인 안 했으면 null) } | { q, error }
export function useUnifiedSearch(q) {
  // 검색어별 결과. 결과의 q 가 지금 q 와 다르면 "찾는 중"
  const [result, setResult] = useState({ q: null });
  const { data: session, isPending } = authClient.useSession();
  const loggedIn = Boolean(session?.session);

  useEffect(() => {
    if (!q || isPending) return;
    let alive = true;
    Promise.all([
      getRecipes({ q }),
      // 재료 검색은 30자까지, 로그인한 사람 것만
      loggedIn && q.length <= 30 ? getIngredients({ q }) : null,
    ])
      .then(([recipes, ingredients]) => alive && setResult({ q, recipes, ingredients }))
      .catch((e) => alive && setResult({ q, error: e.message }));
    return () => { alive = false; };
  }, [q, isPending, loggedIn]);

  return { loading: Boolean(q) && result.q !== q, result };
}
