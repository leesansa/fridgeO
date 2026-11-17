import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router";
import { useLogin } from "../../hooks/useLogin";
import AuthBrand from "../../components/desktop/AuthBrand";
import "../../styles/desktop/auth.css";

// 데스크탑 로그인: 왼쪽 서비스 소개 | 오른쪽 로그인 카드. 로그인은 모바일과 같은 useLogin (성공하면 마이페이지)
const Login = () => {
    const navigate = useNavigate();
    const signedUp = useLocation().state?.signedUp; // 회원가입에서 넘어온 경우에만 완료 안내
    const { error, pending, login } = useLogin();
    const [showPassword, setShowPassword] = useState(false);

    return (
        <div className="dauth">
            <AuthBrand />

            <form
                className="dauth-card"
                onSubmit={(e) => {
                    e.preventDefault();
                    const { email, password } = Object.fromEntries(new FormData(e.currentTarget));
                    login(email, password);
                }}
            >
                <h1>로그인</h1>
                {signedUp && (
                    <p className="dauth-message is-ok" role="status">
                        회원가입이 완료되었습니다! 가입한 이메일로 로그인해 주세요.
                        <button type="button" aria-label="안내 닫기" onClick={() => navigate(".", { replace: true, state: null })}>×</button>
                    </p>
                )}

                {/* Neon Auth 는 이메일 로그인만 지원해서 아이디 칸을 이메일로 씀 */}
                <label htmlFor="dauth-email">이메일</label>
                <input id="dauth-email" name="email" type="email" autoComplete="email" placeholder="gildong1130@gmail.com" required autoFocus />

                <label htmlFor="dauth-password">비밀번호</label>
                <div className="dauth-password">
                    <input id="dauth-password" name="password" type={showPassword ? "text" : "password"} autoComplete="current-password" required />
                    <button type="button" aria-pressed={showPassword} onClick={() => setShowPassword((v) => !v)}>
                        {showPassword ? "숨기기" : "보기"}
                    </button>
                </div>

                {error && <p className="dauth-message" role="alert">{error}</p>}

                <button type="submit" className="dauth-submit" disabled={pending}>{pending ? "확인 중…" : "로그인"}</button>

                <div className="dauth-links">
                    <Link to="/find-id-password">아이디·비밀번호 찾기</Link>
                    <span aria-hidden="true">|</span>
                    <Link to="/signup">회원가입</Link>
                </div>
            </form>
        </div>
    );
};

export default Login;
