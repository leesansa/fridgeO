// 레시피·분류 조회·저장 훅. 컴포넌트는 이 훅만 쓰고 React Query 를 직접 다루지 않음. 불러오는 함수는 api/recipes.js
import { useInfiniteQuery, useMutation, useQuery } from "@tanstack/react-query";
import { createRecipe, deleteRecipe, getCategories, getRecipe, getRecipes, getRecommendedRecipes, updateRecipe } from "../api/recipes";
import { flatPages, queryClient } from "./queryClient";

// 레시피 하나의 캐시 키 (북마크·팔로우·리뷰 훅도 씀)
export const recipeKey = (id) => ["recipe", String(id)];

// 분류 목록. 거의 안 바뀌므로 한 번 받으면 계속 씀
// enabled = false 면 아직 받지 않음 (데스크탑 분류 메뉴는 처음 열 때 받음)
export const useCategories = ({ enabled = true } = {}) =>
  useQuery({ queryKey: ["categories"], queryFn: getCategories, staleTime: Infinity, enabled });

// 레시피 목록 첫 페이지. params = { q, category }. enabled = false 면 받지 않음
export const useRecipes = (params, { enabled = true } = {}) =>
  useQuery({ queryKey: ["recipes", params], queryFn: () => getRecipes(params), enabled });

// 레시피 목록 무한 스크롤 (cursor 로 다음 페이지). data = { items }
export const useRecipePages = ({ categoryId, q }) =>
  useInfiniteQuery({
    queryKey: ["recipes", "list", { category: categoryId, q }],
    queryFn: ({ pageParam }) => getRecipes({ cursor: pageParam, category: categoryId, q }),
    initialPageParam: 0,
    getNextPageParam: (last) => last.nextCursor ?? undefined,
    select: flatPages,
  });

// 내 냉장고 재료로 만들 수 있는 추천 (메인 모바일·데스크탑이 같은 캐시를 씀)
export const useRecommendedRecipes = () => useQuery({ queryKey: ["recipes", "recommend"], queryFn: getRecommendedRecipes });

// 레시피 하나. 상세·수정·리뷰 작성이 같은 캐시를 씀. id 가 없으면 받지 않음
export const useRecipe = (id) =>
  useQuery({ queryKey: recipeKey(id), queryFn: () => getRecipe(id), enabled: Boolean(id) });

// 레시피를 쓰거나 고치거나 지우면: 목록(추천 포함)·그 레시피·내 정보(내 레시피·북마크 목록·숫자)
const refreshAfterRecipeChange = (id) => {
  queryClient.invalidateQueries({ queryKey: ["recipes"] });
  if (id) queryClient.invalidateQueries({ queryKey: recipeKey(id) });
  queryClient.invalidateQueries({ queryKey: ["me"] });
};

// mutateAsync(body) → { id }
export const useCreateRecipe = () =>
  useMutation({ mutationFn: createRecipe, onSuccess: ({ id }) => refreshAfterRecipeChange(id) });

// mutateAsync({ id, body }) → { id }
export const useUpdateRecipe = () =>
  useMutation({ mutationFn: ({ id, body }) => updateRecipe(id, body), onSuccess: (_data, { id }) => refreshAfterRecipeChange(id) });

// mutateAsync(id)
export const useDeleteRecipe = () =>
  useMutation({
    mutationFn: deleteRecipe,
    onSuccess: (_data, id) => {
      queryClient.removeQueries({ queryKey: recipeKey(id) });
      refreshAfterRecipeChange();
    },
  });
