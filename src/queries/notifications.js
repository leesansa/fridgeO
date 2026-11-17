// 알림 조회·저장 훅. 불러오는 함수는 api/notifications.js
// 서버는 알림 목록을 받을 때 기한 5일 이하 재료의 알림을 만들고, 재료가 바뀌면 queries/ingredients 가 이 캐시를 다시 받게 함
import { useMutation, useQuery } from "@tanstack/react-query";
import { clearNotifications, getNotifications, markNotificationsRead } from "../api/notifications";
import { useLoggedIn } from "../hooks/useLoggedIn";
import { queryClient } from "./queryClient";

const KEY = ["notifications"];

// { items, unread }. 로그인했을 때만 받음
export const useNotifications = () => {
  const loggedIn = useLoggedIn();
  return useQuery({ queryKey: KEY, queryFn: getNotifications, enabled: loggedIn });
};

// 화면을 먼저 바꾸고(change) 저장, 실패하면 되돌림
const useOptimistic = (mutationFn, change) =>
  useMutation({
    mutationFn,
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: KEY });
      const before = queryClient.getQueryData(KEY);
      if (before) queryClient.setQueryData(KEY, change(before));
      return { before };
    },
    onError: (_e, _vars, ctx) => ctx?.before && queryClient.setQueryData(KEY, ctx.before),
  });

// 알림센터를 열면 모두 읽음 (메인의 빨간 점이 꺼짐)
// 각 알림의 read 는 그대로 둠: 데스크탑 알림센터가 열 때 안 읽었던 알림을 "새 알림"으로 보여 줌
export const useMarkNotificationsRead = () => useOptimistic(markNotificationsRead, (data) => ({ ...data, unread: 0 }));

// 전체삭제
export const useClearNotifications = () => useOptimistic(clearNotifications, (data) => ({ ...data, items: [], unread: 0 }));
