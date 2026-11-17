import { Link } from "react-router";
import AccountMenu from "../../components/desktop/AccountMenu";
import { useMe, useUpdateSettings } from "../../queries/me";
import { TERMS } from "../../utils/terms";
import "../../styles/desktop/account.css";

// 데스크탑 알림 설정 · 약관: 왼쪽 계정 메뉴 | 오른쪽 알림 설정 카드 + 약관 (모바일은 접어 두고, 데스크탑은 펼쳐서 보여 줌)
// 켜기/끄기는 queries/me, 약관 내용은 모바일과 같은 utils/terms
const Settings = () => {
    const me = useMe();
    const settings = useUpdateSettings(); // 먼저 바꿔 보여 주고 실패하면 되돌림
    const expiryAlert = me.data?.expiry_alert ?? null; // 불러오기 전 null
    const toggle = () => settings.mutate({ expiryAlert: !expiryAlert });
    const error = settings.error ? `설정을 저장하지 못했어요. ${settings.error.message}` : me.error?.message ?? "";

    return (
        <div className="daccount">
            <AccountMenu />
            <main className="daccount-main">
                <h1>알림 설정 · 약관</h1>

                <section className="daccount-card" aria-labelledby="daccount-alert">
                    <h2 id="daccount-alert">알림 설정</h2>
                    <div className="daccount-switch-row">
                        <div>
                            <strong id="daccount-expiry-label">유통기한 임박 알림</strong>
                            <p className="daccount-hint">남은 기한이 5일 이하인 재료가 생기면 알림센터와 종 아이콘으로 알려 드려요.</p>
                        </div>
                        <button
                            type="button"
                            role="switch"
                            className="daccount-switch"
                            aria-checked={Boolean(expiryAlert)}
                            aria-labelledby="daccount-expiry-label"
                            disabled={expiryAlert === null}
                            onClick={toggle}
                        >
                            <span aria-hidden="true" />
                        </button>
                    </div>
                    <p className="daccount-hint">
                        {expiryAlert === null ? "설정을 불러오는 중…"
                            : expiryAlert ? "지금 켜져 있어요. 끄면 새 유통기한 알림이 만들어지지 않아요."
                            : "지금 꺼져 있어요. 이미 받은 알림은 알림센터에 그대로 남아요."}
                        {" "}<Link to="/notification">알림센터 보기 ›</Link>
                    </p>
                    {error && <p className="daccount-message" role="alert">{error}</p>}
                </section>

                {TERMS.map((t) => (
                    <section key={t.title} className="daccount-card" aria-label={t.title}>
                        <h2>{t.title}</h2>
                        <ol className="daccount-terms">
                            {t.body.map((line) => <li key={line}>{line}</li>)}
                        </ol>
                    </section>
                ))}
            </main>
        </div>
    );
};

export default Settings;
