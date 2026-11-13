import { useState } from "react";
import { useNavigate } from "react-router";
import { apiFetch, authClient, authErrorMessage, getSession, PHONE_FORMAT_MESSAGE, toE164 } from "../utils/auth";
// 헤더·카드·입력 줄은 로그인 화면과 같은 디자인
import "../styles/Notification.css";
import "../styles/Login.css";
import chevron from "../assets/main/chevron.png";
import line from "../assets/login/line.svg";

// +821012345678 → 010-1234-5678
const formatPhone = (p) => p?.replace(/^\+82/, "0").replace(/^(\d{3})(\d{3,4})(\d{4})$/, "$1-$2-$3");

// 개인정보 관리: 비밀번호를 다시 확인한 뒤에만 내 정보를 보여 준다 (페이지를 나가면 다시 확인)
// 닉네임은 바로, 휴대폰은 새 번호로 받은 인증번호를 확인한 뒤 바꾼다
const PrivacyInfo = () => {
    const navigate = useNavigate();
    const [user, setUser] = useState(null); // 확인 전 null. 확인 후 Neon Auth 계정 + nickname(앱 프로필)
    const [error, setError] = useState(""); // 실패 문구와 안내 문구를 같이 표시
    const [pending, setPending] = useState(false);
    const [codeSent, setCodeSent] = useState(false); // 인증번호를 보낸 뒤에만 입력 줄 표시

    // 요청 중 버튼 잠금 + 실패 문구 표시 (회원가입과 같은 방식)
    const run = async (action) => {
        setError("");
        setPending(true);
        try {
            await action();
        } catch (err) {
            setError(authErrorMessage(err));
        } finally {
            setPending(false);
        }
    };

    const changeNickname = (e) => {
        const name = e.currentTarget.form.nickname.value.trim();
        run(async () => {
            await apiFetch("/api/me", { method: "PATCH", body: { name } });
            setError("닉네임을 변경했습니다.");
        });
    };

    const sendCode = (e) => {
        const phoneNumber = toE164(e.currentTarget.form.phone.value);
        if (!phoneNumber) return setError(PHONE_FORMAT_MESSAGE);
        if (phoneNumber === user.phoneNumber) return setError("지금 등록된 번호와 같습니다.");
        run(async () => {
            await authClient.phoneNumber.sendOtp({ phoneNumber });
            setCodeSent(true);
            setError("인증번호를 보냈습니다. 5분 안에 입력해 주세요.");
        });
    };

    // 인증번호가 맞으면 Neon Auth 가 계정의 번호를 새 번호로 바꾼다
    const changePhone = (e) => {
        const { phone, code } = e.currentTarget.form;
        const phoneNumber = toE164(phone.value);
        if (!phoneNumber) return setError(PHONE_FORMAT_MESSAGE);
        run(async () => {
            await authClient.phoneNumber.verify({ phoneNumber, code: code.value.trim(), updatePhoneNumber: true });
            setUser((u) => ({ ...u, phoneNumber }));
            setCodeSent(false);
            setError("휴대폰 번호를 변경했습니다.");
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const { password } = Object.fromEntries(new FormData(e.currentTarget));
        setError("");
        setPending(true);
        try {
            const email = (await getSession())?.user.email;
            if (!email) return navigate("/login");
            // 같은 이메일로 다시 로그인해 비밀번호가 맞는지 확인 (틀리면 예외)
            await authClient.signIn.email({ email, password });
            const me = await apiFetch("/api/me").catch(() => null); // 프로필이 아직 없으면 빈 칸
            setUser({ ...(await getSession()).user, nickname: me?.name ?? "" });
        } catch (err) {
            setError(err?.error?.code === "INVALID_EMAIL_OR_PASSWORD" ? "비밀번호가 올바르지 않습니다." : authErrorMessage(err));
        } finally {
            setPending(false);
        }
    };

    const underline = <span className="signup-line"><img src={line} alt="" /></span>;
    const outputRow = (label, value) => (
        <li className="signup-field">
            <span className="signup-badge">{label}</span>
            <output>{value || "-"}</output>
            {underline}
        </li>
    );

    return (
        <div className="notification-page">
            <header className="notification-header">
                <button type="button" className="notification-back" aria-label="뒤로가기" onClick={() => navigate("/mypage")}>
                    <img src={chevron} alt="" />
                </button>
                <h1 className="notification-title">마이페이지  |  개인정보 관리</h1>
            </header>

            {user ? (
                <form className="signup-card login-card" aria-label="내 개인정보" onSubmit={(e) => e.preventDefault()}>
                    <ul className="signup-fields">
                        {outputRow("이름", user.name)}
                        <li className="signup-field">
                            <label htmlFor="privacy-nickname" className="signup-badge">닉네임</label>
                            <input id="privacy-nickname" name="nickname" defaultValue={user.nickname} maxLength={20} autoComplete="nickname" />
                            <button type="button" className="signup-badge signup-verify" onClick={changeNickname} disabled={pending}>변경</button>
                            {underline}
                        </li>
                        {outputRow("이메일", user.email)}
                        <li className="signup-field">
                            <label htmlFor="privacy-phone" className="signup-badge">휴대폰</label>
                            <input id="privacy-phone" name="phone" type="tel" defaultValue={formatPhone(user.phoneNumber)} placeholder="새 번호 입력" autoComplete="tel" inputMode="numeric" />
                            <button type="button" className="signup-badge signup-verify" onClick={sendCode} disabled={pending}>인증 요청</button>
                            {underline}
                        </li>
                        {codeSent && (
                            <li className="signup-field">
                                <label htmlFor="privacy-code" className="signup-badge">인증번호</label>
                                <input id="privacy-code" name="code" autoComplete="one-time-code" inputMode="numeric" maxLength={6} autoFocus />
                                <button type="button" className="signup-badge signup-verify" onClick={changePhone} disabled={pending}>변경</button>
                                {underline}
                            </li>
                        )}
                        {outputRow("가입일", user.createdAt && new Date(user.createdAt).toLocaleDateString("ko-KR"))}
                    </ul>
                    {error && <p className="auth-error privacy-message" role="alert">{error}</p>}
                </form>
            ) : (
                <form className="signup-card login-card" onSubmit={handleSubmit}>
                    <p className="signup-note">개인정보를 보려면 비밀번호를 입력해 주세요.</p>
                    <ul className="signup-fields">
                        <li className="signup-field">
                            <label htmlFor="privacy-password" className="signup-badge required">비밀번호</label>
                            <input id="privacy-password" name="password" type="password" placeholder="**********" autoComplete="current-password" required autoFocus />
                            <span className="signup-line"><img src={line} alt="" /></span>
                        </li>
                    </ul>
                    <button type="submit" className="signup-submit" disabled={pending}>{pending ? "확인 중…" : "확인"}</button>
                    {error && <p className="auth-error login-error" role="alert">{error}</p>}
                </form>
            )}
        </div>
    );
};

export default PrivacyInfo;
