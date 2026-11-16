import AuthFrame from "./AuthFrame";
import MobileFindAccount from "../mobile/Find_ID_Password";

// 데스크탑 아이디·비밀번호 찾기: 로그인과 같은 두 칸 틀 안에 모바일 찾기 양식 그대로
const FindAccount = () => <AuthFrame title="아이디·비밀번호 찾기"><MobileFindAccount /></AuthFrame>;

export default FindAccount;
