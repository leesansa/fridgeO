import { useEffect, useState } from "react";
import { apiFetch } from "./auth";

// 알림 설정 | 동의/약관 화면 (모바일·데스크탑 공통)

// 서비스가 실제로 하는 일(재료·레시피·리뷰 저장, 휴대폰 인증)에 맞춘 짧은 약관
export const TERMS = [
  {
    title: "서비스 이용약관",
    body: [
      "fridgeO는 냉장고 재료 관리와 레시피 추천 서비스를 제공합니다.",
      "회원은 자신의 계정과 비밀번호를 관리할 책임이 있습니다.",
      "다른 사람을 비방하거나 서비스 운영을 방해하는 리뷰·게시물은 삭제될 수 있습니다.",
      "서비스 내용은 사전 공지 후 변경되거나 중단될 수 있습니다.",
    ],
  },
  {
    title: "개인정보 처리방침",
    body: [
      "수집 항목: 이름, 이메일, 휴대폰 번호, 비밀번호(암호화 저장), 프로필 사진, 등록한 재료·리뷰·북마크.",
      "이용 목적: 회원 식별, 휴대폰 본인 인증·계정 찾기, 유통기한 알림, 레시피 추천.",
      "보관 기간: 회원 탈퇴 시 지체 없이 파기합니다.",
      "휴대폰 인증 문자 발송을 위해 문자 발송 업체(SOLAPI)에 휴대폰 번호를 전달합니다.",
    ],
  },
];

// 유통기한 임박 알림 켜기/끄기 (DB users.expiry_alert). 불러오기 전 expiryAlert = null
export function useExpiryAlertSetting() {
  const [expiryAlert, setExpiryAlert] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    apiFetch("/api/me").then((me) => setExpiryAlert(me.expiry_alert)).catch((e) => setError(e.message));
  }, []);

  const toggle = async () => {
    const next = !expiryAlert;
    setExpiryAlert(next); // 먼저 바꿔 보여 주고 실패하면 되돌림
    setError("");
    try {
      await apiFetch("/api/me/settings", { method: "PATCH", body: { expiryAlert: next } });
    } catch (e) {
      setExpiryAlert(!next);
      setError(`설정을 저장하지 못했어요. ${e.message}`);
    }
  };

  return { expiryAlert, error, toggle };
}
