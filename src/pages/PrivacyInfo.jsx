import { useState } from "react";
import { useNavigate } from "react-router";
import { authClient, authErrorMessage, getSession } from "../utils/auth";
// 헤더·카드·입력 줄은 로그인 화면과 같은 디자인
import "../styles/Notification.css";
import "../styles/Login.css";
import chevron from "../assets/main/chevron.png";
import line from "../assets/login/line.svg";

// +821012345678 → 010-1234-5678
const formatPhone = (p) => p?.replace(/^\+82/, "0").replace(/^(\d{3})(\d{3,4})(\d{4})$/, "$1-$2-$3");

// 개인정보 관리: 비밀번호를 다시 확인한 뒤에만 내 정보를 보여 준다 (보기 전용, 페이지를 나가면 다시 확인)
const PrivacyInfo = () => {
    const navigate = useNavigate();
    const [user, setUser] = useState(null); // 확인 전 null
    const [error, setError] = useState("");
    const [pending, setPending] = useState(false);

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
            setUser((await getSession()).user);
        } catch (err) {
            setError(err?.error?.code === "INVALID_EMAIL_OR_PASSWORD" ? "비밀번호가 올바르지 않습니다." : authErrorMessage(err));
        } finally {
            setPending(false);
        }
    };

    const rows = user && [
        ["이름", user.name],
        ["이메일", user.email],
        ["휴대폰", formatPhone(user.phoneNumber) || "등록 안 됨"],
        ["가입일", user.createdAt && new Date(user.createdAt).toLocaleDateString("ko-KR")],
    ];

    return (
        <div className="notification-page">
            <header className="notification-header">
                <button type="button" className="notification-back" aria-label="뒤로가기" onClick={() => navigate("/mypage")}>
                    <img src={chevron} alt="" />
                </button>
                <h1 className="notification-title">마이페이지  |  개인정보 관리</h1>
            </header>

            {user ? (
                <section className="signup-card login-card" aria-label="내 개인정보">
                    <ul className="signup-fields">
                        {rows.map(([label, value]) => (
                            <li key={label} className="signup-field">
                                <span className="signup-badge">{label}</span>
                                <output>{value || "-"}</output>
                                <span className="signup-line"><img src={line} alt="" /></span>
                            </li>
                        ))}
                    </ul>
                </section>
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
