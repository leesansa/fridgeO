// 레시피 분류 아이콘: DB icon_url → 그림 파일 → 직접 그린 SVG → (새 분류) 첫 글자 순
import all from "../../assets/recipe/category/all.png";
import side from "../../assets/recipe/category/side.png";
import main from "../../assets/recipe/category/main.png";
import soup from "../../assets/recipe/category/soup.png";
import stew from "../../assets/recipe/category/stew.png";

const circle = (fill) => <circle cx="20" cy="20" r="20" fill={fill} />;
const bowl = <path d="M10 21h20a10 8 0 0 1-20 0Z" fill="#2b2b2b" />;
const rice = <ellipse cx="20" cy="21" rx="10" ry="4.5" fill="#fff" />;

// 분류 이름 → 그림 (원래 그림 파일처럼: 색 원 + 가운데 납작한 그림 하나).
// DB categories.icon_url 이 있으면 그게 먼저, 둘 다 없으면(새 분류) 첫 글자 아이콘
const ICONS = {
    전체: all,
    밑반찬: side,
    메인반찬: main,
    "국/탕": soup,
    찌개: stew,
    "밥/죽/떡": <>{circle("#2fbfa9")}{bowl}{rice}<path d="m12 9 9 10M15 8l7 11" stroke="#d93a3a" strokeWidth="1.6" strokeLinecap="round" /></>,
    // 빨대 꽂은 음료 잔 + 레몬
    "차/음료/술": <>{circle("#2fbfa9")}<path d="M22 21l3-14h3" stroke="#e3462f" strokeWidth="1.6" fill="none" strokeLinecap="round" strokeLinejoin="round" /><path d="M13 11h14l-2 19a2 2 0 0 1-2 1.8h-6a2 2 0 0 1-2-1.8Z" fill="#fff" fillOpacity=".85" /><path d="M13.6 17h12.8l-1.4 13a1.5 1.5 0 0 1-1.5 1.3h-7a1.5 1.5 0 0 1-1.5-1.3Z" fill="#f39b2d" /><circle cx="13.5" cy="12" r="3.5" fill="#f9e04b" stroke="#fff" strokeWidth="1" /><path d="M13.5 9v6M10.5 12h6" stroke="#fff" strokeWidth=".6" /></>,
    // 젓가락으로 면을 집어 올린 그릇 + 만두
    "면/만두": <>{circle("#27aee0")}<path d="M15 10.5 31 6M16 12.5l16-4" stroke="#8a4b2a" strokeWidth="1.6" strokeLinecap="round" /><path d="M17.5 19.5c.8-2-.8-3 0-4.5s-.8-2.5 0-4M20.3 19.5c.8-2-.8-3 0-4.5s-.8-2.5 0-4.5" stroke="#f9c74f" strokeWidth="1.4" fill="none" strokeLinecap="round" /><ellipse cx="20" cy="20" rx="11" ry="2.6" fill="#f9c74f" /><path d="M22.5 20a4.5 4 0 0 1 9 0Z" fill="#fff6e0" stroke="#d9a05b" strokeWidth=".8" /><path d="M25 16.6l.6 1.6M27 16.1v1.8M29 16.6l-.6 1.6" stroke="#d9a05b" strokeWidth=".7" strokeLinecap="round" /><path d="M9 20.5h22a11 9.5 0 0 1-22 0Z" fill="#fff" /><path d="M12 24.5l2 1.5 2-1.5 2 1.5 2-1.5 2 1.5 2-1.5 2 1.5 2-1.5" stroke="#e3462f" strokeWidth=".9" fill="none" strokeLinejoin="round" /><rect x="16" y="29" width="8" height="2" rx="1" fill="#fff" /></>,
    // 컵케이크
    디저트: <>{circle("#ec5b7a")}<path d="M13 22h14l-2.5 9h-9Z" fill="#f6dfb4" stroke="#7a5a33" strokeWidth="1" strokeLinejoin="round" /><path d="M17.5 23.5l.5 6M22.5 23.5l-.5 6" stroke="#7a5a33" strokeWidth=".8" /><path d="M12 22.5c0-5 3.5-8 8-8s8 3 8 8Z" fill="#fff" /><path d="M14.5 19c3 1.5 8 1.5 11 0" stroke="#f3b6c2" strokeWidth="1.4" fill="none" strokeLinecap="round" /><path d="M20 11c0-2 1-3 2.5-3.5" stroke="#6b9a3a" strokeWidth="1" fill="none" strokeLinecap="round" /><circle cx="20" cy="13" r="2.3" fill="#d93a3a" /></>,
    // 포크 + 젓가락 (동서양 섞기)
    퓨전: <>{circle("#ec5b7a")}<g transform="rotate(-22 20 20)" stroke="#fff" fill="none" strokeLinecap="round"><path d="M14 9v4.5a2.5 2.5 0 0 0 5 0V9M16.5 9v4.5" strokeWidth="1.3" /><path d="M16.5 16v15" strokeWidth="2.2" /></g><g transform="rotate(22 20 20)" stroke="#f6dfb4" strokeWidth="1.8" strokeLinecap="round"><path d="M22.5 8.5v23M25.5 8.5v23" /></g></>,
    // 장독
    "김치/젓갈/장류": <>{circle("#f9b52e")}<path d="M14 15h12c3 3 3.5 9 1.5 13.5-1 2-14 2-15 0-2-4.5-1.5-10.5 1.5-13.5Z" fill="#8a4b2a" /><path d="M13.2 21.5h13.6" stroke="#e3462f" strokeWidth="3" /><path d="M15 25.5c.3 1.5.8 2.3 1.5 2.8" stroke="#c98a5e" strokeWidth="1" fill="none" strokeLinecap="round" /><rect x="13" y="11.5" width="14" height="4" rx="2" fill="#5a2f1a" /><rect x="18.5" y="9" width="3" height="3" rx="1" fill="#5a2f1a" /></>,
    // 소스병
    "양념/소스/잼": <>{circle("#2fbfa9")}<path d="M17.5 11.5h5v3l3 3V30a1.5 1.5 0 0 1-1.5 1.5h-8a1.5 1.5 0 0 1-1.5-1.5V17.5l3-3Z" fill="#e3462f" /><rect x="17.5" y="7.5" width="5" height="4" rx="1" fill="#fff" /><rect x="16.5" y="20" width="7" height="6" rx="1" fill="#fff" /><circle cx="20" cy="23" r="1.6" fill="#e3462f" /><path d="M19.6 21.3c.3-.6.8-.8 1.3-.7" stroke="#6b9a3a" strokeWidth=".8" fill="none" /></>,
    // 파스타 접시 + 포크
    양식: <>{circle("#ec5b7a")}<ellipse cx="20" cy="24" rx="13" ry="7" fill="#fff" /><ellipse cx="20" cy="23.5" rx="9" ry="4.6" fill="#f2f2f2" /><path d="M13.5 23c2-3 4 1 6-1.5s4 1 6.5-1M14 25c2-2 4 1 6-1s3.5 1 5.5-.5" stroke="#f9c74f" strokeWidth="1.6" fill="none" strokeLinecap="round" /><circle cx="20" cy="22" r="2" fill="#d93a3a" /><path d="M28 7v4.5a1.8 1.8 0 0 1-3.6 0V7M26.2 7v4.5M26.2 13.3v6" stroke="#fff" strokeWidth="1.2" fill="none" strokeLinecap="round" /></>,
    // 채소 그릇
    샐러드: <>{circle("#f9b52e")}<circle cx="15" cy="19" r="4" fill="#6b9a3a" /><circle cx="21" cy="16.5" r="4.5" fill="#8cc152" /><circle cx="26" cy="19.5" r="3.5" fill="#6b9a3a" /><circle cx="18" cy="19.5" r="2" fill="#e3462f" /><circle cx="24" cy="18" r="1.8" fill="#e3462f" /><path d="M10 21h20a10 9 0 0 1-20 0Z" fill="#fff" /><rect x="16" y="29" width="8" height="2" rx="1" fill="#fff" /></>,
    // 김 나는 수프 그릇
    스프: <>{circle("#27aee0")}<path d="M16 15c-1.5-2 1.5-3 0-5M20 15c-1.5-2 1.5-3 0-5M24 15c-1.5-2 1.5-3 0-5" stroke="#fff" strokeWidth="1.4" fill="none" strokeLinecap="round" /><path d="M10 19h20a10 9 0 0 1-20 0Z" fill="#fff" /><ellipse cx="20" cy="19" rx="10" ry="2.5" fill="#f39b2d" /><circle cx="22" cy="19" r=".9" fill="#6b9a3a" /><circle cx="17.5" cy="18.8" r=".7" fill="#6b9a3a" /><rect x="16" y="27" width="8" height="2" rx="1" fill="#fff" /></>,
    // 한 입 먹은 초코칩 쿠키
    과자: <>{circle("#27aee0")}<circle cx="20" cy="20" r="10" fill="#d9a05b" stroke="#a8692f" strokeWidth="1.2" /><circle cx="29" cy="12.5" r="4" fill="#27aee0" /><circle cx="16" cy="17" r="1.4" fill="#5a2f1a" /><circle cx="22" cy="16" r="1.2" fill="#5a2f1a" /><circle cx="18" cy="23.5" r="1.3" fill="#5a2f1a" /><circle cx="24.5" cy="22" r="1.4" fill="#5a2f1a" /><circle cx="13.5" cy="21.5" r=".9" fill="#5a2f1a" /></>,
    빵: <>{circle("#f9b52e")}<path d="M13 13a4 4 0 0 1 5-3h7a4 4 0 0 1 2 7v10l-12 3V17a4 4 0 0 1-2-4Z" fill="#f6dfb4" stroke="#7a5a33" strokeWidth="1.2" strokeLinejoin="round" /><circle cx="19" cy="19" r=".9" fill="#7a5a33" /><circle cx="22" cy="23" r=".9" fill="#7a5a33" /><circle cx="18" cy="25" r=".9" fill="#7a5a33" /></>,
};
const FALLBACK_COLORS = ["#2fbfa9", "#f9b52e", "#27aee0", "#e3462f", "#91ae6e"];

const CategoryIcon = ({ cat, index }) => {
    const icon = cat.icon_url ?? ICONS[cat.name];
    if (typeof icon === "string") return <img src={icon} alt="" />;
    return (
        <svg aria-hidden="true" viewBox="0 0 40 40">
            {icon ?? <>
                {circle(FALLBACK_COLORS[index % FALLBACK_COLORS.length])}
                <text x="20" y="25.5" textAnchor="middle" fontSize="15" fontWeight="700" fill="#fff">{cat.name[0]}</text>
            </>}
        </svg>
    );
};

export default CategoryIcon;
