import { Link } from "react-router";
import backIcon from "../../assets/lucide_chevron_left_icon.png";

// 냉장재료 등록 상단: 홈으로 돌아가기 + 제목
const RegisterHeader = () => (
  <header className="ingredient-add-header">
    <Link to="/" className="fridge-back" aria-label="홈으로">
      <img src={backIcon} alt="" />
    </Link>
    <span className="ingredient-add-header-title">홈 | 냉장재료 등록</span>
  </header>
);

export default RegisterHeader;
