import { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate, useSearchParams } from "react-router";
import Header from "../components/Header.jsx";
import { apiFetch } from "../utils/auth.js";
import "../styles/recipes.css";

// assets/recipe 안의 이미지를 한 번에 불러와 확장자를 뺀 파일명으로 꺼낸다 (예: category/all.png → "all")
const images = Object.fromEntries(
    Object.entries(import.meta.glob("../assets/recipe/**/*.png", { eager: true, import: "default" }))
        .map(([path, url]) => [path.split("/").pop().replace(/\.\w+$/, ""), url]),
);

const SHOW = 7; // 한 번에 보이는 분류 수
const CAT_WIDTH = 348; // 보이는 창 너비 (recipes.css 의 .cat-window)

const circle = (fill) => <circle cx="20" cy="20" r="20" fill={fill} />;
const bowl = <path d="M10 21h20a10 8 0 0 1-20 0Z" fill="#2b2b2b" />;
const rice = <ellipse cx="20" cy="21" rx="10" ry="4.5" fill="#fff" />;

// 분류 이름 → 그림 (원래 그림 파일처럼: 색 원 + 가운데 납작한 그림 하나).
// DB categories.icon_url 이 있으면 그게 먼저, 둘 다 없으면(새 분류) 첫 글자 아이콘
const ICONS = {
    전체: images.all,
    밑반찬: images.side,
    메인반찬: images.main,
    "국/탕": images.soup,
    찌개: images.stew,
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

const ALL = { id: null, name: "전체" };

// 카드 안 별 5개의 x 위치 (카드 왼쪽 위 기준 px)
const STARS = [158, 172, 186, 200, 214];

// 레시피 카드 무한 스크롤. 분류·검색어가 바뀌면 부모가 key 로 새로 만들어서 목록·cursor·스크롤이 처음부터 시작
const RecipeCards = ({ categoryId, q }) => {
    const navigate = useNavigate();
    const [recipes, setRecipes] = useState([]);
    const [cursor, setCursor] = useState(0); // 다음에 불러올 위치, null 이면 끝
    const [error, setError] = useState("");
    const loadingRef = useRef(false); // 같은 페이지를 두 번 부르지 않게
    const listRef = useRef(null);
    const sentinelRef = useRef(null);

    const loadMore = useCallback(async () => {
        if (loadingRef.current || cursor === null) return;
        loadingRef.current = true;
        try {
            const query = new URLSearchParams({ cursor });
            if (categoryId !== null) query.set("category", categoryId);
            if (q) query.set("q", q);
            const data = await apiFetch(`/api/recipes?${query}`);
            setRecipes((prev) => [...prev, ...data.items]);
            setCursor(data.nextCursor);
        } catch (e) {
            setError(e.message);
        } finally {
            loadingRef.current = false;
        }
    }, [cursor, categoryId, q]);

    // 목록 끝(sentinel)이 보이면 다음 페이지. cursor 가 바뀌면 다시 관찰해서 화면이 찰 때까지 이어 불러옴
    useEffect(() => {
        if (error || cursor === null) return;
        const observer = new IntersectionObserver(
            ([entry]) => entry.isIntersecting && loadMore(),
            { root: listRef.current, rootMargin: "200px" },
        );
        observer.observe(sentinelRef.current);
        return () => observer.disconnect();
    }, [loadMore, error, cursor]);

    return (
        <div className="card-list" ref={listRef}>
            {recipes.map((r) => {
                const go = () => navigate(`/recipe/${r.id}`);
                const stars = Math.round(r.rating ?? 0);
                return (
                    <article
                        key={r.id}
                        className="card"
                        role="link"
                        tabIndex={0}
                        aria-label={`${r.title} 레시피 상세정보 보기`}
                        onClick={go}
                        onKeyDown={(e) => e.key === "Enter" && go()}
                    >
                        <span className="card-photo" style={{ left: 4, top: 4, width: 122, height: 122 }}>
                            {r.image_url && <img src={r.image_url} alt="" loading="lazy" referrerPolicy="no-referrer" />}
                        </span>
                        <h3 className="card-title" style={{ left: 150, top: 9, width: 238, height: 42 }}>{r.title}</h3>
                        <span className="avatar" style={{ left: 158, top: 62, width: 25, height: 25 }} />
                        <span className="author" style={{ left: 194, top: 65, height: 19 }}>{r.author ?? "알 수 없음"}</span>
                        <span className="sr-only">별점 {r.rating ?? 0}점, 리뷰 {r.review_count}개</span>
                        {STARS.map((x, i) => (
                            <span key={x} className={i < stars ? "star" : "star star--off"} style={{ left: x, top: 102, width: 13, height: 13 }} />
                        ))}
                        <span className="views" style={{ left: 238, top: 100, height: 18 }} aria-hidden="true">({r.review_count.toLocaleString()})</span>
                    </article>
                );
            })}
            <div ref={sentinelRef} aria-hidden="true" />
            {error && (
                <p className="list-status" role="alert">
                    {error} <button type="button" onClick={() => setError("")}>다시 시도</button>
                </p>
            )}
            {cursor === null && recipes.length === 0 && (
                <p className="list-status">{q ? `'${q}'에 맞는 레시피가 없어요.` : "레시피가 없습니다."}</p>
            )}
        </div>
    );
};

const RecipeList = () => {
    const [categories, setCategories] = useState([ALL]);
    const [selected, setSelected] = useState(null); // 고른 분류 id, null = 전체
    const [start, setStart] = useState(0); // 지금 맨 왼쪽에 보이는 분류 번호
    const maxStart = Math.max(0, categories.length - SHOW);

    // 검색어는 주소 ?q= 에 둔다 → 상세에서 뒤로 오거나 새로고침해도 유지, 상세 페이지 Enter 검색도 여기로 옴
    const [searchParams, setSearchParams] = useSearchParams();
    const q = searchParams.get("q")?.trim() ?? "";
    const [text, setText] = useState(q); // 입력창 글자 (타자 칠 때마다 바뀜)

    // 입력이 0.3초 멈추면 검색 (글자마다 요청하지 않게)
    useEffect(() => {
        const timer = setTimeout(() => {
            const next = text.trim();
            if (next !== q) setSearchParams(next ? { q: next } : {}, { replace: true });
        }, 300);
        return () => clearTimeout(timer);
    }, [text, q, setSearchParams]);

    // DB 분류 목록. 실패하면 "전체"만 남고 레시피 목록은 그대로 동작
    useEffect(() => {
        apiFetch("/api/categories")
            .then((rows) => setCategories([ALL, ...rows]))
            .catch((e) => console.error("분류를 불러오지 못했습니다", e));
    }, []);

    // 7칸씩 넘기되 끝을 넘어가지 않게
    const move = (direction) => setStart((s) => Math.min(maxStart, Math.max(0, s + direction * SHOW)));

    const onCategoryKeyDown = (event) => {
        if (event.key !== "ArrowRight" && event.key !== "ArrowLeft") return;
        event.preventDefault();
        move(event.key === "ArrowRight" ? 1 : -1);
    };

    return (
        <div className="recipe-page">
            <section className="category" aria-label="레시피 분류" onKeyDown={onCategoryKeyDown}>
                <h2 className="category-title">레시피 <em>분류</em></h2>
                <button type="button" className="chevron chevron--left" aria-label="이전 분류" disabled={start === 0} onClick={() => move(-1)}>
                    <svg viewBox="0 0 24 40" aria-hidden="true"><path d="M6 4l12 16L6 36" /></svg>
                </button>
                <button type="button" className="chevron chevron--right" aria-label="다음 분류" disabled={start === maxStart} onClick={() => move(1)}>
                    <svg viewBox="0 0 24 40" aria-hidden="true"><path d="M18 4 6 20l12 16" /></svg>
                </button>

                <div className="cat-window" tabIndex={0} aria-label="분류 목록 (← → 키로 넘기기)">
                    <ul className="cat-track" style={{ transform: `translateX(${(-start * CAT_WIDTH) / SHOW}px)` }}>
                        {categories.map((cat, i) => {
                            const visible = i >= start && i < start + SHOW; // 안 보이는 분류는 Tab 키로 가지 않게
                            return (
                                <li key={cat.id ?? "all"} aria-hidden={!visible}>
                                    <button
                                        type="button"
                                        className="cat"
                                        tabIndex={visible ? 0 : -1}
                                        aria-pressed={selected === cat.id}
                                        onClick={() => setSelected(cat.id)}
                                    >
                                        <CategoryIcon cat={cat} index={i} />
                                        {/* "/" 뒤에서만 줄바꿈 (김치/젓갈/장류 같은 긴 이름) */}
                                        <span>{cat.name.replaceAll("/", "/​")}</span>
                                    </button>
                                </li>
                            );
                        })}
                    </ul>
                </div>
            </section>

            <Header value={text} onChange={setText} />

            <RecipeCards key={`${selected ?? "all"}|${q}`} categoryId={selected} q={q} />
        </div>
    );
};

export default RecipeList;
