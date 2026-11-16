import { useEffect, useState } from "react";
import { Link, useOutletContext } from "react-router";
import expiryIcon from "../../assets/main/expiry.png";
import userIcon from "../../assets/lucide_user_icon.png";
import recipeIcon from "../../assets/lucide_recipe_icon.png";
import "../../vendor/lucian-icons/bell.js";
import "../../styles/desktop/notification.css";

// 알림 종류: 왼쪽 거르기 이름 · 아이콘 · 눌러서 갈 곳
const TYPES = {
    expiry: { label: "유통기한 임박", icon: expiryIcon, link: ["/fridge", "냉장고에서 확인"] },
    follow: { label: "새 팔로워", icon: userIcon, link: ["/mypage", "팔로워 보기"] },
    review: { label: "새 리뷰", icon: recipeIcon, link: ["/mypage", "내 레시피 보기"] },
};

// 데스크탑 알림센터: 왼쪽 종류별 거르기 | 가운데 알림 목록 (처음 연 때 안 읽었던 알림은 "새 알림") | 오른쪽 알림 설정 안내
// 알림 목록·읽음·전체삭제는 모바일과 같이 Layout 의 Outlet context
const Notification = () => {
    const { notifications, markAllRead, clearAll } = useOutletContext();
    const [type, setType] = useState(null); // null = 전체

    // 알림센터를 열면 확인한 것으로 보고 DB 에 읽음 저장 + 종의 빨간 점을 끈다
    useEffect(() => { markAllRead(); }, [markAllRead]);

    // 열자마자 읽음으로 저장되므로, 이 화면에서 본 안 읽은 알림 id 를 모아 두고 "새 알림"으로 보여 줌
    // (목록이 늦게 도착해도 그때 더함. 렌더 중 state 갱신은 React 가 권하는 "값이 바뀌면 맞추기" 방식)
    const unread = notifications.filter((n) => !n.read).map((n) => n.id);
    const unreadKey = unread.join(",");
    const [fresh, setFresh] = useState({ key: "", ids: new Set() });
    if (unreadKey && unreadKey !== fresh.key) setFresh({ key: unreadKey, ids: new Set([...fresh.ids, ...unread]) });

    const counts = Object.fromEntries(Object.keys(TYPES).map((t) => [t, notifications.filter((n) => n.type === t).length]));
    const shown = type ? notifications.filter((n) => n.type === type) : notifications;

    return (
        <div className="dnoti">
            <div className="dnoti-head">
                <h1>알림센터 <span>{notifications.length}</span></h1>
                {notifications.length > 0 && (
                    <button type="button" className="dnoti-clear" onClick={clearAll}>전체삭제</button>
                )}
            </div>

            <div className="dnoti-layout">
                <nav className="dnoti-filters" aria-label="알림 종류">
                    {[[null, "전체", notifications.length], ...Object.entries(TYPES).map(([t, v]) => [t, v.label, counts[t]])].map(([t, label, n]) => (
                        <button key={label} type="button" aria-pressed={type === t} onClick={() => setType(t)}>
                            <span>{label}</span>
                            <span className="dnoti-count">{n}</span>
                        </button>
                    ))}
                </nav>

                <section aria-label="알림 목록">
                    {shown.length === 0 ? (
                        <div className="dnoti-empty">
                            <lucian-bell size="56" tone="line" aria-hidden="true" />
                            <p>{type ? `${TYPES[type].label} 알림이 없어요` : "새로운 소식이 없어요"}</p>
                        </div>
                    ) : (
                        <ul className="dnoti-list">
                            {shown.map((item) => {
                                const kind = TYPES[item.type];
                                return (
                                    <li key={item.id} className={fresh.ids.has(item.id) ? "is-new" : undefined}>
                                        <span className="dnoti-icon" aria-hidden="true">{kind && <img src={kind.icon} alt="" />}</span>
                                        <div className="dnoti-body">
                                            <div className="dnoti-meta">
                                                <strong>{item.title}</strong>
                                                {item.badge && <em className={`dnoti-badge ${item.badge.className}`}>{item.badge.label}</em>}
                                                {fresh.ids.has(item.id) && <span className="dnoti-new">새 알림</span>}
                                                <time>{item.time}</time>
                                            </div>
                                            <p>{item.message}</p>
                                        </div>
                                        {kind && <Link to={kind.link[0]} className="dnoti-link">{kind.link[1]} ›</Link>}
                                    </li>
                                );
                            })}
                        </ul>
                    )}
                </section>

                <aside className="dnoti-side">
                    <h2>알림 설정</h2>
                    <p>유통기한이 5일 이하로 남은 재료가 있으면 알려 드려요. 알림을 끄거나 켜려면 설정에서 바꿀 수 있어요.</p>
                    <Link to="/mypage/settings" className="dnoti-side-link">알림 설정 바꾸기 ›</Link>
                </aside>
            </div>
        </div>
    );
};

export default Notification;
