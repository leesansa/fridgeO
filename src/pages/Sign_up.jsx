import { useState } from "react";
import { useNavigate } from "react-router";
import { apiFetch, authClient, authErrorMessage, PHONE_FORMAT_MESSAGE, toE164 } from "../utils/auth";
// 헤더(뒤로가기 + "홈 | 페이지명")는 알림센터와 같은 디자인이라 그 스타일을 같이 쓴다
import "../styles/Notification.css";
import "../styles/Login.css";
import chevron from "../assets/main/chevron.png";
import line from "../assets/login/line.svg";

// 1단계: 계정 정보. Neon Auth는 이메일로 로그인해서 아이디 칸은 없앴다.
// 이름은 Neon Auth 계정에, 닉네임은 앱 프로필(users.name)에 저장한다
const accountFields = [
    { label: "이름", name: "name", required: true, autoComplete: "name" },
    { label: "비밀번호", name: "password", type: "password", required: true, autoComplete: "new-password", minLength: 8 },
    { label: "닉네임", name: "nickname", required: true, autoComplete: "nickname", maxLength: 20 },
    { label: "이메일", name: "email", type: "email", required: true, autoComplete: "email" },
    // shortcut: 저장할 컬럼이 없어 서버로 보내지 않음, 필요하면 users에 컬럼 추가
    { label: "가입경로", name: "referral" },
];

// 2단계: 휴대폰 인증 (아이디·비밀번호 찾기용). 번호는 Neon Auth 계정에 저장된다
const phoneFields = [
    { label: "휴대폰", name: "phone", type: "tel", required: true, autoComplete: "tel", inputMode: "numeric", verify: true },
    { label: "인증번호", name: "code", required: true, autoComplete: "one-time-code", inputMode: "numeric", maxLength: 6 },
];

const SignUp = () => {
    const navigate = useNavigate();
    const [step, setStep] = useState("account");
    const [message, setMessage] = useState("");
    const [pending, setPending] = useState(false);

    // 요청 중 버튼 잠금 + 실패 문구 표시를 두 단계가 같이 쓴다
    const run = async (action) => {
        setMessage("");
        setPending(true);
        try {
            await action();
        } catch (err) {
            setMessage(authErrorMessage(err));
        } finally {
            setPending(false);
        }
    };

    // 가입하면 바로 로그인 상태가 된다. 번호 연결은 로그인한 계정에만 되므로 로그아웃하지 않고 2단계로
    const handleAccount = (e) => {
        e.preventDefault();
        const { name, email, password, nickname } = Object.fromEntries(new FormData(e.currentTarget));
        run(async () => {
            await authClient.signUp.email({ name, email, password });
            await apiFetch("/api/me", { method: "POST", body: { name: nickname } });
            setStep("phone");
        });
    };

    const handleSendCode = (e) => {
        const phoneNumber = toE164(e.currentTarget.form.phone.value);
        if (!phoneNumber) return setMessage(PHONE_FORMAT_MESSAGE);
        run(async () => {
            await authClient.phoneNumber.sendOtp({ phoneNumber });
            setMessage("인증번호를 보냈습니다. 5분 안에 입력해 주세요.");
        });
    };

    // 인증되면 번호를 계정에 연결하고 로그아웃 → 로그인 화면(Figma 가입 완료 흐름)
    const handlePhone = (e) => {
        e.preventDefault();
        const { phone, code } = Object.fromEntries(new FormData(e.currentTarget));
        const phoneNumber = toE164(phone);
        if (!phoneNumber) return setMessage(PHONE_FORMAT_MESSAGE);
        run(async () => {
            await authClient.phoneNumber.verify({ phoneNumber, code: code.trim(), updatePhoneNumber: true });
            await authClient.signOut();
            navigate("/login", { state: { signedUp: true } });
        });
    };

    const isAccount = step === "account";
    const fields = isAccount ? accountFields : phoneFields;

    return (
        <div className="notification-page">
            <header className="notification-header">
                <button type="button" className="notification-back" aria-label="뒤로가기">
                    <img src={chevron} alt="" />
                </button>
                <h1 className="notification-title">홈  |  회원가입</h1>
            </header>

            {/* key로 단계마다 폼을 새로 만들어 1단계 입력값이 남지 않게 한다 */}
            <form key={step} className="signup-card" onSubmit={isAccount ? handleAccount : handlePhone}>
                <p className="signup-note">
                    {isAccount ? "* 빨간 박스는 필수 입력사항입니다." : "* 아이디·비밀번호 찾기에 쓸 휴대폰을 인증해 주세요."}
                </p>
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
                                inputMode={f.inputMode}
                                required={f.required}
                                minLength={f.minLength}
                                maxLength={f.maxLength}
                            />
                            {f.verify && (
                                <button type="button" className="signup-badge signup-verify" onClick={handleSendCode} disabled={pending}>
                                    인증 요청
                                </button>
                            )}
                            <span className="signup-line"><img src={line} alt="" /></span>
                        </li>
                    ))}
                </ul>
                {!isAccount && (
                    <label className="signup-consent">
                        <input type="checkbox" required /> 휴대폰 번호 수집·이용(계정 찾기 목적)에 동의합니다.
                    </label>
                )}
                <button type="submit" className="signup-submit" disabled={pending}>
                    {pending ? "처리 중…" : isAccount ? "가입하기" : "인증 완료"}
                </button>
                {message && <p className="auth-error signup-error" role="alert">{message}</p>}
            </form>
        </div>
    );
};

export default SignUp;
