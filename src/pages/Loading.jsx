import "../styles/Loading.css";
import logo from "../assets/Logo_FridgeO.png";
import script from "../assets/loading/fridgeO_script.png";

const Loading = () => {
    return (
        <div className="loading-page">
            <div className="loading-brand">
                <img className="loading-logo" src={logo} alt="fridgeO" />
                <img className="loading-script" src={script} alt="" />
            </div>
        </div>
    );
};

export default Loading;
