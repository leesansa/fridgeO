import { useIsDesktop } from "../hooks/useIsDesktop";

// 같은 주소에서 화면 폭에 따라 모바일·데스크탑 화면 중 하나를 그림 (모바일·데스크탑 공통). router.jsx 에서 씀
const Responsive = ({ mobile: Mobile, desktop: Desktop }) => (useIsDesktop() ? <Desktop /> : <Mobile />);

export default Responsive;
