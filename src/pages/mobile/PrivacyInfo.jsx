import { useNavigate } from "react-router";
import { usePrivacyInfo } from "../../hooks/usePrivacyInfo";
import { formatPhone } from "../../utils/auth";
// 헤더·카드·입력 줄은 로그인 화면과 같은 디자인
import "../../styles/mobile/Notification.css";
import "../../styles/mobile/Login.css";
import chevron from "../../assets/main/chevron.png";
import line from "../../assets/login/line.svg";

// 개인정보 관리: 비밀번호를 다시 확인한 뒤에만 내 정보를 보여 준다 (페이지를 나가면 다시 확인)
// 닉네임은 바로, 휴대폰은 새 번호로 받은 인증번호를 확인한 뒤 바꾼다
const PrivacyInfo = () => {
    const navigate = useNavigate();
    // 비밀번호 확인·닉네임·휴대폰 변경은 데스크탑과 공통 (usePrivacyInfo). 실패 문구와 안내 문구를 같은 자리에 표시
    const { user, message, pending, codeSent, verify, changeNickname: saveNickname, sendCode: requestCode, changePhone: savePhone } = usePrivacyInfo();
    const error = message.text;

    const changeNickname = (e) => saveNickname(e.currentTarget.form.nickname.value);
    const sendCode = (e) => requestCode(e.currentTarget.form.phone.value);
    const changePhone = (e) => {
        const { phone, code } = e.currentTarget.form;
        savePhone(phone.value, code.value);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        verify(new FormData(e.currentTarget).get("password"));
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
