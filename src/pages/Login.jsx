import { useState } from "react";
import { useLocation, useNavigate } from "react-router";
import { apiFetch, authClient, authErrorMessage } from "../utils/auth";
// 헤더는 알림센터, 입력 줄/배지/버튼은 회원가입(Sign_up)과 같은 디자인이라 그 스타일을 같이 쓴다
import "../styles/Notification.css";
import "../styles/Login.css";
import chevron from "../assets/main/chevron.png";
import line from "../assets/login/line.svg";

// Neon Auth는 이메일 로그인만 지원해서 Figma의 '아이디' 칸을 이메일로 쓴다. 입력 예시는 placeholder
const fields = [
    { label: "이메일", name: "email", type: "email", placeholder: "gildong1130@gmail.com", autoComplete: "email" },
    { label: "비밀번호", name: "password", type: "password", placeholder: "**********", autoComplete: "current-password" },
];

const Login = () => {
    const navigate = useNavigate();
    // 회원가입에서 넘어온 경우에만 완료 안내를 띄운다
    const signedUp = useLocation().state?.signedUp;
    const [error, setError] = useState("");
    const [pending, setPending] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        const { email, password } = Object.fromEntries(new FormData(e.currentTarget));
        setError("");
        setPending(true);
        try {
            await authClient.signIn.email({ email, password });
            // 가입 직후 프로필 생성이 실패했던 경우를 위해 로그인 때도 프로필 행을 보장한다
            await apiFetch("/api/me", { method: "POST", body: {} });
            navigate("/mypage");
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
                <h1 className="notification-title">홈  |  로그인</h1>
            </header>

            <form className="signup-card login-card" onSubmit={handleSubmit}>
                <ul className="signup-fields">
                    {fields.map((f) => (
                        <li key={f.name} className="signup-field">
                            <label htmlFor={`login-${f.name}`} className="signup-badge required">{f.label}</label>
                            <input id={`login-${f.name}`} name={f.name} type={f.type} placeholder={f.placeholder} autoComplete={f.autoComplete} required />
                            <span className="signup-line"><img src={line} alt="" /></span>
                        </li>
                    ))}
                </ul>
                <button type="submit" className="signup-submit" disabled={pending}>{pending ? "확인 중…" : "로그인"}</button>
                <button type="button" className="login-forgot" onClick={() => navigate("/find-id-password")}>아이디, 비밀번호를 잊으셨나요?</button>
                <button type="button" className="login-forgot login-signup" onClick={() => navigate("/signup")}>회원가입</button>
                {error && <p className="auth-error login-error" role="alert">{error}</p>}
            </form>

            {/* Figma 회원가입_완료: 로그인 화면 위를 어둡게 덮고 가운데 문구, 누르면 닫힘 (state를 지워 새로고침해도 다시 안 뜸) */}
            {signedUp && (
                <div className="signup-done" role="status" onClick={() => navigate(".", { replace: true, state: null })}>
                    <p>회원가입이 완료되었습니다!</p>
                </div>
            )}
        </div>
    );
};

export default Login;
