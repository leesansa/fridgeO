import { Link } from "react-router";
import plusIcon from "../../assets/lucide_circle_plus_icon.png";

// 오른쪽 아래 떠 있는 + 버튼: 식재료 추가 화면으로
const AddButton = () => (
  <div className="fridge-add-position">
    <Link to="/ingredient" className="fridge-add-button" aria-label="식재료 추가">
      <img src={plusIcon} alt="" />
    </Link>
  </div>
);

export default AddButton;
