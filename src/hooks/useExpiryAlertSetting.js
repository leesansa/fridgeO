import { useMe, useUpdateSettings } from "../queries/me";

// 알림 설정 화면(모바일·데스크탑 공통): 유통기한 임박 알림 켜기/끄기 (DB users.expiry_alert). 불러오기 전 expiryAlert = null
// 먼저 바꿔 보여 주고 실패하면 되돌림 (queries/me 의 useUpdateSettings)
export function useExpiryAlertSetting() {
  const me = useMe();
  const settings = useUpdateSettings();
  const expiryAlert = me.data?.expiry_alert ?? null;

  const toggle = () => settings.mutate({ expiryAlert: !expiryAlert });

  const error = settings.error ? `설정을 저장하지 못했어요. ${settings.error.message}` : me.error?.message ?? "";
  return { expiryAlert, error, toggle };
}
