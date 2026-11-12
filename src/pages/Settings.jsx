import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { apiFetch } from "../utils/auth";
// 헤더는 알림센터와 같은 디자인
import "../styles/Notification.css";
import chevron from "../assets/main/chevron.png";

// 서비스가 실제로 하는 일(재료·레시피·리뷰 저장, 휴대폰 인증)에 맞춘 짧은 약관
const TERMS = [
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

// 알림 설정 | 동의/약관: 유통기한 임박 알림 켜기/끄기(DB users.expiry_alert) + 약관 보기
const Settings = () => {
  const navigate = useNavigate();
  const [expiryAlert, setExpiryAlert] = useState(null); // 불러오기 전 null
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

  return (
    <div className="notification-page">
      <header className="notification-header">
        <button type="button" className="notification-back" aria-label="뒤로가기" onClick={() => navigate("/mypage")}>
          <img src={chevron} alt="" />
        </button>
        <h1 className="notification-title">마이페이지  |  알림 설정</h1>
      </header>

      <main style={styles.main}>
        <section style={styles.card}>
          <h2 style={styles.title}>알림 설정</h2>
          <div style={styles.row}>
            <span>
              <span style={styles.label}>유통기한 임박 알림</span>
              <span style={styles.sub}>남은 기한이 5일 이하인 재료를 알려 드려요</span>
            </span>
            <button
              type="button"
              role="switch"
              aria-checked={Boolean(expiryAlert)}
              aria-label="유통기한 임박 알림"
              disabled={expiryAlert === null}
              onClick={toggle}
              style={{ ...styles.switch, backgroundColor: expiryAlert ? "#9BAA6E" : "#CCC" }}
            >
              <span style={{ ...styles.knob, transform: expiryAlert ? "translateX(20px)" : "none" }} />
            </button>
          </div>
          {error && <p role="alert" style={styles.error}>{error}</p>}
        </section>

        <section style={styles.card}>
          <h2 style={styles.title}>동의/약관</h2>
          {TERMS.map((t) => (
            <details key={t.title} style={styles.details}>
              <summary style={styles.label}>{t.title}</summary>
              <ul style={styles.terms}>
                {t.body.map((line) => <li key={line}>{line}</li>)}
              </ul>
            </details>
          ))}
        </section>
      </main>
    </div>
  );
};

const styles = {
  main: { padding: "13px 10px 89px", display: "flex", flexDirection: "column", gap: "13px" },
  card: { backgroundColor: "#FFF", borderRadius: "15px", padding: "20px 24px" },
  title: { margin: "0 0 12px", fontSize: "15px", fontWeight: 700, color: "#222" },
  row: { display: "flex", justifyContent: "space-between", alignItems: "center", gap: "12px" },
  label: { display: "block", fontSize: "14px", fontWeight: 600, color: "#222", cursor: "pointer" },
  sub: { display: "block", margin: "4px 0 0", fontSize: "12px", color: "#777" },
  switch: { flexShrink: 0, position: "relative", width: "46px", height: "26px", padding: 0, border: 0, borderRadius: "13px", cursor: "pointer" },
  knob: { position: "absolute", top: "3px", left: "3px", width: "20px", height: "20px", borderRadius: "50%", backgroundColor: "#FFF", transition: "transform 0.15s" },
  error: { margin: "10px 0 0", fontSize: "12px", color: "#B96462" },
  details: { padding: "10px 0", borderBottom: "1px solid #F0F0F0" },
  terms: { margin: "8px 0 0", paddingLeft: "18px", fontSize: "12px", lineHeight: 1.6, color: "#555" },
};

export default Settings;
