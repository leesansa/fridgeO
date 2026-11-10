import { useState } from "react";
import { useNavigate } from "react-router";
import { apiFetch, authClient, authErrorMessage } from "../utils/auth";
// 헤더(뒤로가기 + "홈 | 페이지명")는 알림센터와 같은 디자인이라 그 스타일을 같이 쓴다
import "../styles/Notification.css";
import "../styles/Login.css";
import chevron from "../assets/main/chevron.png";
import line from "../assets/login/line.svg";

// Neon Auth는 이메일로 로그인해서 아이디 칸은 없앴다.
// 이름은 Neon Auth 계정에, 닉네임은 앱 프로필(users.name)에 저장한다
const fields = [
    { label: "이름", name: "name", required: true, autoComplete: "name" },
    { label: "비밀번호", name: "password", type: "password", required: true, autoComplete: "new-password", minLength: 8 },
    // shortcut: 이메일 인증(OTP)이 아직 없어 입력하지 않아도 가입됨, Neon Auth emailOtp 연동 시 필수로 바꿀 것
    { label: "인증번호", name: "code", required: true, verify: true, autoComplete: "one-time-code" },
    { label: "닉네임", name: "nickname", required: true, autoComplete: "nickname", maxLength: 20 },
    { label: "이메일", name: "email", type: "email", required: true, autoComplete: "email" },
    // shortcut: 저장할 컬럼이 없어 서버로 보내지 않음, 필요하면 users에 컬럼 추가
    { label: "가입경로", name: "referral" },
];

const SignUp = () => {
    const navigate = useNavigate();
    const [error, setError] = useState("");
    const [pending, setPending] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        const { name, email, password, nickname } = Object.fromEntries(new FormData(e.currentTarget));
        setError("");
        setPending(true);
        try {
            await authClient.signUp.email({ name, email, password });
            // 가입하면 바로 로그인 상태가 되므로, 그 토큰으로 닉네임 프로필을 만든 뒤 로그아웃 → 로그인 화면(Figma 흐름)
            await apiFetch("/api/me", { method: "POST", body: { name: nickname } });
            await authClient.signOut();
            navigate("/login", { state: { signedUp: true } });
        } catch (err) {
            setError(authErrorMessage(err));
        } finally {
            setPending(false);
        }
    };

    return (
        <div className="notification-page">
            <header className="notification-header">
                <button type="button" className="notification-back" aria-label="뒤로가기">
                    <img src={chevron} alt="" />
                </button>
                <h1 className="notification-title">홈  |  회원가입</h1>
            </header>

            <form className="signup-card" onSubmit={handleSubmit}>
                <p className="signup-note">* 빨간 박스는 필수 입력사항입니다.</p>
                <ul className="signup-fields">
                    {fields.map((f) => (
                        <li key={f.name} className="signup-field">
                            <label htmlFor={`signup-${f.name}`} className={`signup-badge${f.required ? " required" : ""}`}>
                                {f.label}
                            </label>
                            <input
                                id={`signup-${f.name}`}
                                name={f.name}
                                type={f.type ?? "text"}
                                autoComplete={f.autoComplete}
                                required={f.required && !f.verify}
                                minLength={f.minLength}
                                maxLength={f.maxLength}
                            />
                            {f.verify && (
                                <button type="button" className="signup-badge signup-verify">인증 완료</button>
                            )}
                            <span className="signup-line"><img src={line} alt="" /></span>
                        </li>
                    ))}
                </ul>
                <button type="submit" className="signup-submit" disabled={pending}>{pending ? "가입 중…" : "가입하기"}</button>
                {error && <p className="auth-error signup-error" role="alert">{error}</p>}
            </form>
        </div>
    );
};

export default SignUp;
