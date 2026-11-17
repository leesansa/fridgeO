import { useNavigate } from "react-router";
import { TERMS, useExpiryAlertSetting } from "../../hooks/useSettings";
// 헤더는 알림센터와 같은 디자인
import "../../styles/mobile/Notification.css";
import chevron from "../../assets/main/chevron.png";

// 알림 설정 | 동의/약관: 유통기한 임박 알림 켜기/끄기 + 약관 보기 (설정·약관 내용은 데스크탑과 공통 useSettings)
const Settings = () => {
  const navigate = useNavigate();
  const { expiryAlert, error, toggle } = useExpiryAlertSetting();

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
