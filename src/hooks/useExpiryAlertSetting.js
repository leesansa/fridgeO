import { useEffect, useState } from "react";
import { getMe, updateSettings } from "../api/me";

// 알림 설정 화면(모바일·데스크탑 공통): 유통기한 임박 알림 켜기/끄기 (DB users.expiry_alert). 불러오기 전 expiryAlert = null
export function useExpiryAlertSetting() {
  const [expiryAlert, setExpiryAlert] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    getMe().then((me) => setExpiryAlert(me.expiry_alert)).catch((e) => setError(e.message));
  }, []);

  const toggle = async () => {
    const next = !expiryAlert;
    setExpiryAlert(next); // 먼저 바꿔 보여 주고 실패하면 되돌림
    setError("");
    try {
      await updateSettings({ expiryAlert: next });
    } catch (e) {
      setExpiryAlert(!next);
      setError(`설정을 저장하지 못했어요. ${e.message}`);
    }
  };

  return { expiryAlert, error, toggle };
}
