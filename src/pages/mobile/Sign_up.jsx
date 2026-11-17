import { useState } from "react";
import { useNavigate } from "react-router";
import { authClient, authErrorMessage, PHONE_FORMAT_MESSAGE, toE164 } from "../../utils/auth";
import { createProfile } from "../../api/me";
import { checkEmail } from "../../api/signup";
// 헤더(뒤로가기 + "홈 | 페이지명")는 알림센터와 같은 디자인이라 그 스타일을 같이 쓴다
import "../../styles/mobile/Notification.css";
import "../../styles/mobile/Login.css";
import chevron from "../../assets/main/chevron.png";
import line from "../../assets/login/line.svg";

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
    // 1단계 입력값. 계정은 2단계 "인증 요청" 때 만든다 (1단계만 하고 나가면 계정이 안 생김)
    const [account, setAccount] = useState(null);
    const [created, setCreated] = useState(false); // 인증번호를 다시 요청할 때 가입을 또 하지 않게
    // 로그인했는데 번호가 없으면(인증 요청 후 나갔던 계정) 가입은 끝난 것이므로 2단계부터
    const { data: session } = authClient.useSession();
    const needsPhone = Boolean(session?.session) && !session.user?.phoneNumber;
    const signedUp = created || needsPhone;
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

    // 1단계: 이메일 중복만 확인하고 입력값을 들고 2단계로 (아직 가입 안 함)
    const handleAccount = (e) => {
        e.preventDefault();
        const values = Object.fromEntries(new FormData(e.currentTarget));
        run(async () => {
            const { available } = await checkEmail(values.email);
            if (!available) throw new Error("이미 가입된 이메일입니다.");
            setAccount(values);
        });
    };

    // 2단계 인증 요청: 처음이면 여기서 가입(가입하면 바로 로그인됨. 번호 연결은 로그인한 계정에만 되므로 필요) → 인증번호 발송
    const handleSendCode = (e) => {
        const phoneNumber = toE164(e.currentTarget.form.phone.value);
        if (!phoneNumber) return setMessage(PHONE_FORMAT_MESSAGE);
        run(async () => {
            if (!signedUp) {
                const { name, email, password, nickname } = account;
                try {
                    await authClient.signUp.email({ name, email, password });
                } catch (err) {
                    // 중복 확인 뒤 그 사이에 같은 이메일로 누가 가입한 경우: 1단계로 돌려보냄
                    if (authErrorMessage(err) === "이미 가입된 이메일입니다.") setAccount(null);
                    throw err;
                }
                setCreated(true);
                // 프로필 생성이 실패해도 로그인 때 다시 만들므로(useLogin) 가입은 계속 진행
                await createProfile({ name: nickname }).catch((err) => console.error("프로필 생성 실패:", err));
            }
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

    const isAccount = !account && !needsPhone;
    const fields = isAccount ? accountFields : phoneFields;

    // 뒤로가기: 1단계는 그대로, 가입 전 2단계는 1단계로, 가입 후 2단계(인증 요청 후)는 로그아웃 후 홈
    const handleBack = isAccount
        ? undefined
        : signedUp
          ? () => authClient.signOut().then(() => navigate("/"))
          : () => setAccount(null);

    return (
        <div className="notification-page">
            <header className="notification-header">
                <button type="button" className="notification-back" aria-label="뒤로가기" onClick={handleBack}>
                    <img src={chevron} alt="" />
                </button>
                <h1 className="notification-title">홈  |  회원가입</h1>
            </header>

            {/* key로 단계마다 폼을 새로 만들어 1단계 입력값이 남지 않게 한다 */}
            <form key={isAccount ? "account" : "phone"} className="signup-card" onSubmit={isAccount ? handleAccount : handlePhone}>
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
                    {pending ? "처리 중…" : isAccount ? "다음" : "인증 완료"}
                </button>
                {message && <p className="auth-error signup-error" role="alert">{message}</p>}
            </form>
        </div>
    );
};

export default SignUp;
