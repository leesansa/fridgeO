import { useState } from "react";
import { useNavigate } from "react-router";
import Header from "../components/Header.jsx";
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

// img 가 있으면 그림 파일, svg 가 있으면 직접 그린 아이콘
const categories = [
    { name: "전체", img: "all" },
    { name: "밑반찬", img: "side" },
    { name: "메인반찬", img: "main" },
    { name: "국/탕", img: "soup" },
    { name: "찌개", img: "stew" },
    { name: "초스피드", img: "speed" },
    { name: "손님접대", img: "guest" },
    { name: "밥/죽/떡", svg: <>{circle("#2fbfa9")}{bowl}{rice}<path d="m12 9 9 10M15 8l7 11" stroke="#d93a3a" strokeWidth="1.6" strokeLinecap="round" /></> },
    { name: "술안주", svg: <>{circle("#f9b52e")}<rect x="8" y="12" width="24" height="8" rx="4" fill="#e3462f" /><path d="M20 20v12M17 20v4a3 3 0 0 0 6 0v-4" stroke="#7fc6e8" strokeWidth="2" fill="none" strokeLinecap="round" /></> },
    { name: "면/만두", svg: <>{circle("#2fbfa9")}<ellipse cx="20" cy="23" rx="14" ry="6" fill="#fff" /><path d="M11 22c3-3 15-3 18 0-2 2-16 2-18 0Z" fill="#f39b2d" /><circle cx="17" cy="20" r="1.6" fill="#d9442e" /><circle cx="22" cy="19.5" r="1.4" fill="#d9442e" /><circle cx="25" cy="21" r="1.2" fill="#6b9a3a" /></> },
    { name: "일상", svg: <>{circle("#27aee0")}{bowl}{rice}<path d="M21 17h6l-1 4h-5Z" fill="#d93a3a" /><path d="m13 8 7 11M16 7l6 12" stroke="#d93a3a" strokeWidth="1.6" strokeLinecap="round" /></> },
    { name: "빵", svg: <>{circle("#f9b52e")}<path d="M13 13a4 4 0 0 1 5-3h7a4 4 0 0 1 2 7v10l-12 3V17a4 4 0 0 1-2-4Z" fill="#f6dfb4" stroke="#7a5a33" strokeWidth="1.2" strokeLinejoin="round" /><circle cx="19" cy="19" r=".9" fill="#7a5a33" /><circle cx="22" cy="23" r=".9" fill="#7a5a33" /><circle cx="18" cy="25" r=".9" fill="#7a5a33" /></> },
];

const recipes = [
    { id: 1, imageUrl: "https://images.unsplash.com/photo-1583480241328-87b2795fbb8f?auto=format&fit=crop&w=600&q=80", alt: "코코아 가루를 입힌 파베 초콜릿", author: "달콤한키친", title: ["파베초콜릿 만들기", "입에서 사르르 녹는 생초콜릿"] },
    { id: 2, imageUrl: "https://images.squarespace-cdn.com/content/v1/642aad7f5bfb85079881c691/b20c5a06-35b8-4a28-804e-f60a44508dbd/shabu%2Bhot%2Bpot%2Bjapan.jpg?format=1200w", alt: "소고기와 채소를 곁들인 샤브샤브", author: "오늘의식탁", title: ["집에서 푸짐하게 즐기는 샤브샤브", "육수부터 소스까지 간단하게"] },
    { id: 3, imageUrl: "https://www.hansik.or.kr/files/magazine/thumbnail/cc863fc2-b978-4720-af30-33ef1083f752.jpg", alt: "고명을 올린 따뜻한 호박죽", author: "따뜻한한끼", title: ["달콤하고 부드러운 호박죽", "새알심 넣어 든든하게 만들기"] },
    { id: 4, imageUrl: "https://image.8dogam.com/resized/product/asset/v1/upload/36c7e94b38094fdca60b671851e124da.jpeg?ext=jpg&res=3x&type=big", alt: "무와 고추가 담긴 동치미", author: "소담한밥상", title: ["시원하고 아삭한 동치미 담그기", "겨울 내내 맛있는 국물김치"] },
];

// 모든 카드가 같은 크기·배치 (카드 왼쪽 위 기준 px)
const CARD_TOP = 201; // 첫 카드 위치
const CARD_HEIGHT = 130;
const CARD_GAP = 24;
const RecipeList = () => {
    const navigate = useNavigate();
    const [start, setStart] = useState(0); // 지금 맨 왼쪽에 보이는 분류 번호
    const maxStart = Math.max(0, categories.length - SHOW);

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
                                <li key={cat.name} aria-hidden={!visible}>
                                    <button type="button" className="cat" tabIndex={visible ? 0 : -1}>
                                        {cat.img
                                            ? <img src={images[cat.img]} alt="" />
                                            : <svg aria-hidden="true" viewBox="0 0 40 40">{cat.svg}</svg>}
                                        <span>{cat.name}</span>
                                    </button>
                                </li>
                            );
                        })}
                    </ul>
                </div>
            </section>

            <Header />

            {recipes.map((r, i) => {
                const go = () => navigate(`/recipe/${r.id}`);
                return (
                    <article
                        key={r.id}
                        className="card"
                        style={{ top: CARD_TOP + i * (CARD_HEIGHT + CARD_GAP), height: CARD_HEIGHT }}
                        role="link"
                        tabIndex={0}
                        aria-label={`${r.title.join(" ")} 레시피 상세정보 보기`}
                        onClick={go}
                        onKeyDown={(e) => e.key === "Enter" && go()}
                    >
                        <span className="card-photo" style={{ left: 4, top: 4, width: 122, height: 122 }}>
                            <img src={r.imageUrl ?? images[r.image]} alt={r.alt} />
                        </span>
                        <h3 className="card-title" style={{ left: 150, top: 9, width: 238, height: 42 }}>
                            {r.title[0]}<br />{r.title[1]}
                        </h3>
                        <span className="avatar" style={{ left: 158, top: 62, width: 25, height: 25 }} />
                        <span className="author" style={{ left: 194, top: 65, height: 19 }}>{r.author}</span>
                    </article>
                );
            })}
        </div>
    );
};

export default RecipeList;
