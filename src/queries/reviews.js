// 리뷰·북마크·작성자 팔로우 조회·저장 훅. 불러오는 함수는 api/reviews.js
import { useInfiniteQuery, useMutation, useQuery } from "@tanstack/react-query";
import { deleteMyReview, getMyReview, getReviews, saveMyReview, setBookmark, setFollow } from "../api/reviews";
import { flatPages, queryClient } from "./queryClient";
import { recipeKey } from "./recipes";

const myReviewKey = (recipeId) => ["review", "mine", String(recipeId)];

// 레시피의 리뷰 목록 ("리뷰 더보기"로 다음 페이지). data = { items }
export const useReviewPages = (recipeId) =>
  useInfiniteQuery({
    queryKey: ["reviews", String(recipeId)],
    queryFn: ({ pageParam }) => getReviews(recipeId, pageParam),
    initialPageParam: 0,
    getNextPageParam: (last) => last.nextOffset ?? undefined,
    select: flatPages,
  });

// 이 레시피에 쓴 내 리뷰 (없으면 null)
export const useMyReview = (recipeId) =>
  useQuery({ queryKey: myReviewKey(recipeId), queryFn: () => getMyReview(recipeId) });

// 리뷰가 바뀌면: 그 레시피(평균·리뷰 수)·리뷰 목록·내 리뷰·레시피 목록의 별점
const refreshAfterReviewChange = (recipeId) => {
  queryClient.invalidateQueries({ queryKey: ["reviews", String(recipeId)] });
  queryClient.invalidateQueries({ queryKey: recipeKey(recipeId) });
  queryClient.invalidateQueries({ queryKey: myReviewKey(recipeId) });
  queryClient.invalidateQueries({ queryKey: ["recipes"] });
};

// mutateAsync({ rating, comment })
export const useSaveMyReview = (recipeId) =>
  useMutation({ mutationFn: (body) => saveMyReview(recipeId, body), onSuccess: () => refreshAfterReviewChange(recipeId) });

// mutateAsync()
export const useDeleteMyReview = (recipeId) =>
  useMutation({ mutationFn: () => deleteMyReview(recipeId), onSuccess: () => refreshAfterReviewChange(recipeId) });

// 상세 화면의 켜기/끄기: 레시피 캐시의 field 를 먼저 바꾸고 저장, 실패하면 되돌림. 끝나면 내 정보(숫자·목록) 다시 받기
// mutate({ recipeId, on })
const useRecipeToggle = (request, field, { alsoRefresh = [] } = {}) =>
  useMutation({
    mutationFn: ({ recipeId, on }) => request(recipeId, on),
    onMutate: async ({ recipeId, on }) => {
      const key = recipeKey(recipeId);
      await queryClient.cancelQueries({ queryKey: key });
      const before = queryClient.getQueryData(key);
      if (before) queryClient.setQueryData(key, { ...before, [field]: on });
      // 북마크 화면에서 해제하면 목록에서도 바로 뺌
      const list = field === "bookmarked" && !on ? queryClient.getQueryData(["me", "bookmarks"]) : undefined;
      if (list) queryClient.setQueryData(["me", "bookmarks"], list.filter((r) => String(r.id) !== String(recipeId)));
      return { key, before, list };
    },
    onError: (_e, _vars, ctx) => {
      if (ctx?.before) queryClient.setQueryData(ctx.key, ctx.before);
      if (ctx?.list) queryClient.setQueryData(["me", "bookmarks"], ctx.list);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["me"] });
      alsoRefresh.forEach((queryKey) => queryClient.invalidateQueries({ queryKey }));
    },
  });

export const useSetBookmark = () => useRecipeToggle(setBookmark, "bookmarked");

// 같은 작성자의 다른 레시피 캐시도 팔로우 여부가 바뀌므로 레시피 캐시 전부 다시 받기
export const useSetFollow = () => useRecipeToggle(setFollow, "following", { alsoRefresh: [["recipe"]] });
