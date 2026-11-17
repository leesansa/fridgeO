import { useSyncExternalStore } from "react";

// 데스크탑 화면(1024px 이상)인지. styles/desktop/*.css 의 @media 폭과 같아야 함
const desktopQuery = window.matchMedia("(min-width: 1024px)");
const subscribe = (cb) => {
  desktopQuery.addEventListener("change", cb);
  return () => desktopQuery.removeEventListener("change", cb);
};

export const useIsDesktop = () => useSyncExternalStore(subscribe, () => desktopQuery.matches);
