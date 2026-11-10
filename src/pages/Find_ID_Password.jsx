import { useState } from "react";
// 헤더는 알림센터, 입력 줄/배지/버튼은 회원가입·로그인과 같은 디자인이라 그 스타일을 같이 쓴다
import "../styles/Notification.css";
import "../styles/Login.css";
import chevron from "../assets/main/chevron.png";
import line from "../assets/login/line.svg";

// Figma 아이디, 비밀번호 찾기 페이지의 입력 예시는 placeholder로 보여준다
const findIdFields = [
    { label: "이메일", name: "email", type: "email", placeholder: "gildong1130@gmail.com" },
    { label: "인증번호", name: "code", placeholder: "147258", verify: true },
];

const findPasswordFields = [
    { label: "이메일", name: "email", type: "email", placeholder: "gildong1130@gmail.com" },
    { label: "인증번호", name: "code", placeholder: "147258", verify: true },
];

const Fields = ({ id, fields, className }) => (
    <ul className={`signup-fields ${className}`}>
        {fields.map((f) => (
            <li key={f.name} className="signup-field">
                <label htmlFor={`${id}-${f.name}`} className="signup-badge required">{f.label}</label>
                <input id={`${id}-${f.name}`} name={f.name} type={f.type ?? "text"} placeholder={f.placeholder} />
                {f.verify && <button type="button" className="signup-badge signup-verify">인증 완료</button>}
                <span className="signup-line"><img src={line} alt="" /></span>
            </li>
        ))}
    </ul>
);

// 버튼을 누르면 아래에 붉은 안내 문구. 이메일·인증번호가 비었으면 입력 안내, 아니면 결과 안내
// shortcut: 실제 조회·메일 발송 없이 문구만 표시, 비밀번호 재설정은 Neon Auth emailOtp(forget-password) 연동 시 교체
const checkInputs = (form, resultMessage) => {
    const { email, code } = Object.fromEntries(new FormData(form));
    return email.trim() && code.trim() ? resultMessage : "이메일과 인증번호를 입력해 주세요.";
};

const Find_ID_Password = () => {
    const [idMessage, setIdMessage] = useState("");
    const [pwMessage, setPwMessage] = useState("");

    const handleFindId = (e) => {
        e.preventDefault();
        setIdMessage(checkInputs(e.currentTarget, "fridgeO는 이메일로 로그인합니다.\n가입하신 이메일이 아이디입니다."));
    };

    const handleFindPassword = (e) => {
        e.preventDefault();
        setPwMessage(checkInputs(e.currentTarget, "비밀번호 재설정은 준비 중입니다."));
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
                    <Fields id="find-id" fields={findIdFields} className="find-id-fields" />
                    <button type="submit" className="signup-submit find-id-btn">아이디 찾기</button>
                    {idMessage && <p className="auth-error find-id-message" role="alert">{idMessage}</p>}
                </form>

                <form onSubmit={handleFindPassword}>
                    <Fields id="find-pw" fields={findPasswordFields} className="find-pw-fields" />
                    <button type="submit" className="signup-submit find-pw-btn">비밀번호 찾기</button>
                    {pwMessage && <p className="auth-error find-pw-message" role="alert">{pwMessage}</p>}
                </form>
            </div>
        </div>
    );
};

export default Find_ID_Password;
