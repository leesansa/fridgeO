import { useState } from "react";
import { authClient, authErrorMessage, getSession, PHONE_FORMAT_MESSAGE, toE164 } from "../utils/auth";
// 헤더는 알림센터, 입력 줄/배지/버튼은 회원가입·로그인과 같은 디자인이라 그 스타일을 같이 쓴다
import "../styles/Notification.css";
import "../styles/Login.css";
import chevron from "../assets/main/chevron.png";
import line from "../assets/login/line.svg";

// 가입 때 인증한 휴대폰으로 찾는다. Figma 입력 예시는 placeholder로 보여준다
const phoneField = { label: "휴대폰", name: "phone", type: "tel", placeholder: "010-1234-5678", autoComplete: "tel", inputMode: "numeric", verify: true };
const codeField = { label: "인증번호", name: "code", placeholder: "147258", autoComplete: "one-time-code", inputMode: "numeric", maxLength: 6 };

const findIdFields = [phoneField, codeField];
const findPasswordFields = [
    phoneField,
    codeField,
    { label: "비밀번호", name: "password", type: "password", placeholder: "새 비밀번호 (8자 이상)", autoComplete: "new-password", minLength: 8 },
];

const Fields = ({ id, fields, className, onSendCode, pending }) => (
    <ul className={`signup-fields ${className}`}>
        {fields.map((f) => (
            <li key={f.name} className="signup-field">
                <label htmlFor={`${id}-${f.name}`} className="signup-badge required">{f.label}</label>
                <input
                    id={`${id}-${f.name}`}
                    name={f.name}
                    type={f.type ?? "text"}
                    placeholder={f.placeholder}
                    autoComplete={f.autoComplete}
                    inputMode={f.inputMode}
                    minLength={f.minLength}
                    maxLength={f.maxLength}
                    required
                />
                {f.verify && (
                    <button type="button" className="signup-badge signup-verify" onClick={onSendCode} disabled={pending}>
                        인증 요청
                    </button>
                )}
                <span className="signup-line"><img src={line} alt="" /></span>
            </li>
        ))}
    </ul>
);

const Find_ID_Password = () => {
    const [idMessage, setIdMessage] = useState("");
    const [pwMessage, setPwMessage] = useState("");
    const [pending, setPending] = useState(false);

    // 요청 중 버튼 잠금 + 실패 문구. 성공 문구는 action이 돌려준 값
    const run = async (setMessage, action) => {
        setMessage("");
        setPending(true);
        try {
            setMessage(await action());
        } catch (err) {
            setMessage(authErrorMessage(err));
        } finally {
            setPending(false);
        }
    };

    // 인증 요청 버튼: 같은 form의 휴대폰 칸 값으로 문자 발송
    const sendCode = (setMessage, send) => (e) => {
        const phoneNumber = toE164(e.currentTarget.form.phone.value);
        if (!phoneNumber) return setMessage(PHONE_FORMAT_MESSAGE);
        run(setMessage, async () => {
            await send(phoneNumber);
            return "인증번호를 보냈습니다. 5분 안에 입력해 주세요.";
        });
    };

    const readForm = (form) => {
        const { phone, code, password } = Object.fromEntries(new FormData(form));
        return { phoneNumber: toE164(phone), code: code.trim(), password };
    };

    // 아이디 찾기: 휴대폰 인증으로 로그인 → 계정 이메일 확인 → 바로 로그아웃
    const handleFindId = (e) => {
        e.preventDefault();
        const { phoneNumber, code } = readForm(e.currentTarget);
        if (!phoneNumber) return setIdMessage(PHONE_FORMAT_MESSAGE);
        run(setIdMessage, async () => {
            await authClient.phoneNumber.verify({ phoneNumber, code });
            const email = (await getSession())?.user.email;
            await authClient.signOut();
            if (!email) throw new Error("계정 정보를 불러오지 못했습니다. 다시 시도해 주세요.");
            return `가입하신 아이디(이메일)는\n${email} 입니다.`;
        });
    };

    // 비밀번호 찾기: 재설정용 인증번호 + 새 비밀번호로 바로 변경
    const handleFindPassword = (e) => {
        e.preventDefault();
        const { phoneNumber, code, password } = readForm(e.currentTarget);
        if (!phoneNumber) return setPwMessage(PHONE_FORMAT_MESSAGE);
        run(setPwMessage, async () => {
            await authClient.phoneNumber.resetPassword({ phoneNumber, otp: code, newPassword: password });
            return "비밀번호를 변경했습니다.\n새 비밀번호로 로그인해 주세요.";
        });
    };

    return (
        <div className="notification-page">
            <header className="notification-header">
                <button type="button" className="notification-back" aria-label="뒤로가기">
                    <img src={chevron} alt="" />
                </button>
                <h1 className="notification-title">홈  |  로그인</h1>
            </header>

            <div className="signup-card login-card find-card">
                {/* 두 form은 위치 지정이 없어 안의 요소들이 기존처럼 카드 기준으로 배치된다 */}
                <form onSubmit={handleFindId}>
                    <Fields
                        id="find-id"
                        fields={findIdFields}
                        className="find-id-fields"
                        pending={pending}
                        onSendCode={sendCode(setIdMessage, (phoneNumber) => authClient.phoneNumber.sendOtp({ phoneNumber }))}
                    />
                    <button type="submit" className="signup-submit find-id-btn" disabled={pending}>아이디 찾기</button>
                    {idMessage && <p className="auth-error find-id-message" role="alert">{idMessage}</p>}
                </form>

                <form onSubmit={handleFindPassword}>
                    <Fields
                        id="find-pw"
                        fields={findPasswordFields}
                        className="find-pw-fields"
                        pending={pending}
                        onSendCode={sendCode(setPwMessage, (phoneNumber) => authClient.phoneNumber.requestPasswordReset({ phoneNumber }))}
                    />
                    <button type="submit" className="signup-submit find-pw-btn" disabled={pending}>비밀번호 찾기</button>
                    {pwMessage && <p className="auth-error find-pw-message" role="alert">{pwMessage}</p>}
                </form>
            </div>
        </div>
    );
};

export default Find_ID_Password;
