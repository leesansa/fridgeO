import AuthFrame from "./AuthFrame";
import MobileSignUp from "../mobile/Sign_up";

// 데스크탑 회원가입: 로그인과 같은 두 칸 틀 안에 모바일 회원가입 양식 그대로
const SignUp = () => <AuthFrame title="회원가입"><MobileSignUp /></AuthFrame>;

export default SignUp;
