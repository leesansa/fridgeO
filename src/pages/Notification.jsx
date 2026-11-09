import { useNavigate } from "react-router";
import "../styles/Notification.css";
import chevron from "../assets/main/chevron.png";

const Notification = () => {
    const navigate = useNavigate();
    // 주소로 바로 들어와 앱 안의 이전 기록이 없으면 앱 밖으로 나가지 않게 홈으로 보낸다
    const goBack = () => (window.history.state?.idx > 0 ? navigate(-1) : navigate("/"));

    return (
        <div className="notification-page">
            <header className="notification-header">
                <button type="button" className="notification-back" aria-label="뒤로가기" onClick={goBack}>
                    <img src={chevron} alt="" />
                </button>
                <h1 className="notification-title">홈  |  알림센터</h1>
            </header>

            <main className="notification-empty">
                <span className="notification-empty-mark" aria-hidden="true" />
                <p>새로운 소식이 없어요</p>
            </main>
        </div>
    );
};

export default Notification;
