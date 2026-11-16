import logo from "../../assets/Logo_FridgeO.svg";
import script from "../../assets/fridgeO_script.png";

const FEATURES = [
    ["냉장고 정리", "보관 장소별로 재료를 보고, 끌어다 놓아 옮겨요"],
    ["유통기한 알림", "기한이 5일 남은 재료를 먼저 알려 드려요"],
    ["레시피 추천", "냉장고에 있는 재료로 만들 수 있는 요리를 찾아요"],
];

// 데스크탑 로그인·회원가입·계정 찾기 왼쪽 서비스 소개. 스타일은 styles/desktop/auth.css
const AuthBrand = () => (
    <section className="dauth-brand" aria-label="fridgeO 소개">
        <div className="dauth-logo">
            <img src={logo} alt="" />
            <img src={script} alt="fridgeO" className="dauth-script" />
        </div>
        <p className="dauth-tagline">오늘도 냉장고를 비워볼까요?</p>
        <ul className="dauth-features">
            {FEATURES.map(([title, desc]) => (
                <li key={title}><strong>{title}</strong><span>{desc}</span></li>
            ))}
        </ul>
    </section>
);

export default AuthBrand;
