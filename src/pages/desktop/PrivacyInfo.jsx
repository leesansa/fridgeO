import { useState } from "react";
import AccountMenu from "../../components/desktop/AccountMenu";
import { usePrivacyInfo } from "../../hooks/usePrivacyInfo";
import { formatPhone } from "../../utils/auth";
import "../../styles/desktop/account.css";

// 데스크탑 개인정보 관리: 왼쪽 계정 메뉴 | 오른쪽 비밀번호 확인 → 기본 정보 · 닉네임 · 휴대폰 번호 카드
// 확인·변경은 모바일과 같은 usePrivacyInfo (화면을 나가면 다시 비밀번호 확인)
const PrivacyInfo = () => {
    const p = usePrivacyInfo();

    return (
        <div className="daccount">
            <AccountMenu />
            <main className="daccount-main">
                <h1>개인정보 관리</h1>
                {p.message.text && (
                    <p className={`daccount-message${p.message.ok ? " is-ok" : ""}`} role={p.message.ok ? "status" : "alert"}>
                        {p.message.text}
                    </p>
                )}
                {p.user ? <PrivacyCards p={p} /> : <PasswordCheck p={p} />}
            </main>
        </div>
    );
};

// 비밀번호 다시 확인
const PasswordCheck = ({ p }) => (
    <form
        className="daccount-card daccount-lock"
        onSubmit={(e) => {
            e.preventDefault();
            p.verify(new FormData(e.currentTarget).get("password"));
        }}
    >
        <svg viewBox="0 0 24 24" aria-hidden="true"><rect x="4" y="10" width="16" height="11" rx="2" /><path d="M8 10V7a4 4 0 0 1 8 0v3" /></svg>
        <h2>본인 확인</h2>
        <p>개인정보를 보호하기 위해 비밀번호를 한 번 더 입력해 주세요.</p>
        <label htmlFor="daccount-password" className="daccount-label">비밀번호</label>
        <input id="daccount-password" name="password" type="password" autoComplete="current-password" required autoFocus />
        <button type="submit" className="daccount-btn primary" disabled={p.pending}>{p.pending ? "확인 중…" : "확인"}</button>
    </form>
);

// 확인 뒤: 기본 정보(읽기 전용) · 닉네임 · 휴대폰
const PrivacyCards = ({ p }) => {
    const [nickname, setNickname] = useState(p.user.nickname);
    const [phone, setPhone] = useState("");
    const [code, setCode] = useState("");

    return (
        <>
            <section className="daccount-card" aria-labelledby="daccount-basic">
                <h2 id="daccount-basic">기본 정보</h2>
                <dl className="daccount-info">
                    <div><dt>이름</dt><dd>{p.user.name || "-"}</dd></div>
                    <div><dt>이메일</dt><dd>{p.user.email || "-"}</dd></div>
                    <div><dt>가입일</dt><dd>{p.user.createdAt ? new Date(p.user.createdAt).toLocaleDateString("ko-KR") : "-"}</dd></div>
                </dl>
            </section>

            <form
                className="daccount-card"
                aria-labelledby="daccount-nick"
                onSubmit={(e) => {
                    e.preventDefault();
                    p.changeNickname(nickname);
                }}
            >
                <h2 id="daccount-nick">닉네임</h2>
                <p className="daccount-hint">레시피·리뷰에 작성자로 보이는 이름이에요. (20자까지)</p>
                <div className="daccount-row">
                    <input aria-label="닉네임" value={nickname} maxLength={20} autoComplete="nickname" onChange={(e) => setNickname(e.target.value)} />
                    <button type="submit" className="daccount-btn primary"
                        disabled={p.pending || !nickname.trim() || nickname.trim() === p.user.nickname}>변경</button>
                </div>
            </form>

            <form
                className="daccount-card"
                aria-labelledby="daccount-phone"
                onSubmit={(e) => {
                    e.preventDefault();
                    if (p.codeSent) p.changePhone(phone, code);
                    else p.sendCode(phone);
                }}
            >
                <h2 id="daccount-phone">휴대폰 번호</h2>
                <p className="daccount-hint">
                    지금 번호: <strong>{formatPhone(p.user.phoneNumber) || "등록 안 됨"}</strong> · 새 번호로 받은 인증번호를 확인하면 바뀌어요.
                </p>
                <div className="daccount-row">
                    <input aria-label="새 휴대폰 번호" type="tel" inputMode="numeric" autoComplete="tel" placeholder="새 번호 (예: 010-1234-5678)"
                        value={phone} onChange={(e) => setPhone(e.target.value)} />
                    <button type={p.codeSent ? "button" : "submit"} className="daccount-btn" disabled={p.pending || !phone.trim()}
                        onClick={p.codeSent ? () => p.sendCode(phone) : undefined}>
                        {p.codeSent ? "다시 받기" : "인증 요청"}
                    </button>
                </div>
                {p.codeSent && (
                    <div className="daccount-row">
                        <input aria-label="인증번호" autoComplete="one-time-code" inputMode="numeric" maxLength={6} placeholder="인증번호 6자리"
                            value={code} onChange={(e) => setCode(e.target.value)} autoFocus />
                        <button type="submit" className="daccount-btn primary" disabled={p.pending || !code.trim()}>번호 변경</button>
                    </div>
                )}
            </form>
        </>
    );
};

export default PrivacyInfo;
