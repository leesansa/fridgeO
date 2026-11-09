import { useEffect } from "react";
import { useNavigate, useOutletContext } from "react-router";
import "../styles/Notification.css";
import chevron from "../assets/main/chevron.png";

const Notification = () => {
    const navigate = useNavigate();
    const { notifications, setNotifications, setHasUnread } = useOutletContext();

    // 알림센터를 열면 확인한 것으로 보고 메인의 빨간 점을 끈다
    useEffect(() => setHasUnread(false), [setHasUnread]);
    // 주소로 바로 들어와 앱 안의 이전 기록이 없으면 앱 밖으로 나가지 않게 홈으로 보낸다
    const goBack = () => (window.history.state?.idx > 0 ? navigate(-1) : navigate("/"));

    return (
        <div className="notification-page">
            <header className="notification-header">
                <button type="button" className="notification-back" aria-label="뒤로가기" onClick={goBack}>
                    <img src={chevron} alt="" />
                </button>
                <h1 className="notification-title">홈  |  알림센터</h1>
                {notifications.length > 0 && (
                    <button type="button" className="notification-clear" onClick={() => setNotifications([])}>
                        전체삭제
                    </button>
                )}
            </header>

            {notifications.length > 0 ? (
                <ul className="notification-list">
                    {notifications.map((item) => (
                        <li className="notification-card" key={item.id}>
                            <div className="notification-card-head">
                                <strong>{item.title}</strong>
                                <span>{item.time}</span>
                            </div>
                            <p>{item.message}</p>
                        </li>
                    ))}
                </ul>
            ) : (
                <main className="notification-empty">
                    <span className="notification-empty-mark" aria-hidden="true" />
                    <p>새로운 소식이 없어요</p>
                </main>
            )}
        </div>
    );
};

export default Notification;
