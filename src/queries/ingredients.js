// 내 재료·재료 사전 조회·저장 훅. 불러오는 함수는 api/ingredients.js
// 내 재료 캐시 키는 모두 "ingredients" 로 시작 → 재료를 바꾸면 한 번에 새로고침
import { useInfiniteQuery, useMutation, useQuery } from "@tanstack/react-query";
import {
  createIngredient, deleteIngredient, getCondiments, getFridgeSummary, getIngredient, getIngredientCatalog, getIngredients, updateIngredient,
} from "../api/ingredients";
import { useLoggedIn } from "../hooks/useLoggedIn";
import { flatPages, queryClient } from "./queryClient";

const NONE = [];

// 재료 사전 [{ name, shelf_life_days }]: 이름 자동완성과 유통기한 기본값. 거의 안 바뀜
// 목록만 돌려줌. 못 불러오면 빈 목록 (자동완성만 안 뜨고 직접 입력은 그대로 됨)
export const useIngredientCatalog = () =>
  useQuery({ queryKey: ["ingredient-catalog"], queryFn: getIngredientCatalog, staleTime: Infinity }).data ?? NONE;

// 내 재료 목록 무한 스크롤 (offset 으로 다음 페이지). params = { sort, q, category, storage, status }. data = { items, total }
export const useIngredientPages = (params) =>
  useInfiniteQuery({
    queryKey: ["ingredients", "list", params],
    queryFn: ({ pageParam }) => getIngredients({ ...params, offset: pageParam }),
    initialPageParam: 0,
    getNextPageParam: (last) => last.nextOffset ?? undefined,
    select: flatPages,
  });

// 통합 검색의 내 재료 (첫 페이지만). enabled = false 면 받지 않음
export const useIngredientSearch = (q, { enabled = true } = {}) =>
  useQuery({ queryKey: ["ingredients", "search", q], queryFn: () => getIngredients({ q }), enabled });

// 고칠 내 재료 하나
export const useIngredient = (id) =>
  useQuery({ queryKey: ["ingredients", "one", String(id)], queryFn: () => getIngredient(id) });

// 내 조미료 [{ name, icon_url }]. 로그인했을 때만 받음
export const useCondiments = () => {
  const loggedIn = useLoggedIn();
  return useQuery({ queryKey: ["ingredients", "condiments"], queryFn: getCondiments, enabled: loggedIn });
};

// 메인 냉장고 카드용 요약. 로그인했을 때만 받음
export const useFridgeSummary = () => {
  const loggedIn = useLoggedIn();
  return useQuery({ queryKey: ["ingredients", "summary"], queryFn: getFridgeSummary, enabled: loggedIn });
};

// 재료가 바뀌면 같이 바뀌는 것: 내 재료 전부(목록·요약·조미료), 추천 레시피, 내 정보의 임박 재료, 유통기한 알림
const refreshAfterIngredientChange = () => {
  queryClient.invalidateQueries({ queryKey: ["ingredients"] });
  queryClient.invalidateQueries({ queryKey: ["recipes", "recommend"] });
  queryClient.invalidateQueries({ queryKey: ["me"], exact: true });
  queryClient.invalidateQueries({ queryKey: ["notifications"] });
};

// mutate(body) / mutateAsync(body). body = { name, quantity, unit, storage, expiryDate }
export const useCreateIngredient = () =>
  useMutation({ mutationFn: createIngredient, onSuccess: refreshAfterIngredientChange });

// mutate({ id, body }). PATCH 는 등록과 같은 전체 값을 받음
export const useUpdateIngredient = () =>
  useMutation({ mutationFn: ({ id, body }) => updateIngredient(id, body), onSuccess: refreshAfterIngredientChange });

// mutate(id). 모든 재료 목록에서 먼저 빼고 삭제, 실패하면 목록을 다시 받아 되돌림
export const useDeleteIngredient = () =>
  useMutation({
    mutationFn: deleteIngredient,
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: ["ingredients", "list"] });
      queryClient.setQueriesData({ queryKey: ["ingredients", "list"] }, (data) => data && {
        ...data,
        pages: data.pages.map((page) => ({ ...page, items: page.items.filter((item) => item.id !== id) })),
      });
    },
    onError: () => queryClient.invalidateQueries({ queryKey: ["ingredients", "list"] }),
    onSuccess: refreshAfterIngredientChange,
  });
