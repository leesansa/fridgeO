import AuthBrand from "../../components/desktop/AuthBrand";
import "../../styles/desktop/auth.css";

// 데스크탑 회원가입·계정 찾기: 로그인과 같은 두 칸 틀 (왼쪽 서비스 소개 | 오른쪽 모바일 화면의 입력 양식 그대로)
// 입력·인증 로직은 모바일 페이지를 그대로 쓰고, 모바일 헤더(뒤로가기·제목)만 숨김 (데스크탑 헤더가 있어서)
const AuthFrame = ({ title, children }) => (
    <div className="dauth">
        <AuthBrand />
        <div className="dauth-embed">
            <h1>{title}</h1>
            {children}
        </div>
    </div>
);

export default AuthFrame;
