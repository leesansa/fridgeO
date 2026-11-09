import { Link } from "react-router";
import "../styles/Navigation.css";
import house from "../assets/main/house.png";
import refrigerator from "../assets/main/refrigerator.png";
import recipe from "../assets/main/recipe.png";
import user from "../assets/main/user.png";

const navItems = [
    { label: "홈", icon: house, to: "/" },
    { label: "냉장고", icon: refrigerator, to: "/fridge" },
    { label: "레시피", icon: recipe, to: "/recipe" },
    { label: "마이페이지", icon: user, to: "/mypage" },
];

const Navigation = () => {
    return (
        <nav className="main-nav">
            {navItems.map((item) => (
                <Link key={item.label} to={item.to} aria-label={item.label}>
                    <img src={item.icon} alt="" />
                </Link>
            ))}
        </nav>
    );
};

export default Navigation;
