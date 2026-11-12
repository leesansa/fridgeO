import { Link } from "react-router";
import backIcon from "../../assets/lucide_chevron_left_icon.png";

// 냉장재료 등록·편집 상단: 홈으로 돌아가기 + 제목
const RegisterHeader = ({ title = "홈 | 냉장재료 등록" }) => (
  <header className="ingredient-form-header">
    <Link to="/" className="fridge-back" aria-label="홈으로">
      <img src={backIcon} alt="" />
    </Link>
    <span className="ingredient-form-header-title">{title}</span>
  </header>
);

export default RegisterHeader;
