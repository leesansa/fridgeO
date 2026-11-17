// 내 정보 조회·저장 훅 (로그인 필요). 불러오는 함수는 api/me.js
import { useMutation, useQuery } from "@tanstack/react-query";
import { getMe, getMyBookmarks, getMyFollows, getMyRecipes, updateMe, updateSettings } from "../api/me";
import { queryClient } from "./queryClient";

// 내 프로필 + 북마크·팔로잉·팔로워 수 + 임박 재료 + 알림 설정(expiry_alert)
export const useMe = () => useQuery({ queryKey: ["me"], queryFn: getMe });

// enabled = false 면 받지 않음 (마이페이지 펼친 목록은 고른 쪽만 받음)
export const useMyBookmarks = ({ enabled = true } = {}) =>
  useQuery({ queryKey: ["me", "bookmarks"], queryFn: getMyBookmarks, enabled });

// type = "following" | "followers"
export const useMyFollows = (type, { enabled = true } = {}) =>
  useQuery({ queryKey: ["me", "follows", type], queryFn: () => getMyFollows(type), enabled });

// 내가 쓴 레시피 (삭제는 queries/recipes 의 useDeleteRecipe)
export const useMyRecipeList = () => useQuery({ queryKey: ["me", "recipes"], queryFn: getMyRecipes });

// 닉네임·프로필 사진 저장. mutateAsync({ name } | { profileImage })
export const useUpdateMe = () =>
  useMutation({ mutationFn: updateMe, onSuccess: () => queryClient.invalidateQueries({ queryKey: ["me"], exact: true }) });

// 알림 설정: 먼저 바꿔 보여 주고 실패하면 되돌림. mutate({ expiryAlert })
export const useUpdateSettings = () =>
  useMutation({
    mutationFn: updateSettings,
    onMutate: async ({ expiryAlert }) => {
      await queryClient.cancelQueries({ queryKey: ["me"], exact: true });
      const before = queryClient.getQueryData(["me"]);
      if (before) queryClient.setQueryData(["me"], { ...before, expiry_alert: expiryAlert });
      return { before };
    },
    onError: (_e, _vars, ctx) => ctx?.before && queryClient.setQueryData(["me"], ctx.before),
    onSettled: () => queryClient.invalidateQueries({ queryKey: ["me"], exact: true }),
  });
