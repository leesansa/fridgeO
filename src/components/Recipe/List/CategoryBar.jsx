import { useState } from "react";
import CategoryIcon from "./CategoryIcon.jsx";

const SHOW = 7; // 한 번에 보이는 분류 수
const CAT_WIDTH = 348; // 보이는 창 너비 (recipes.css 의 .cat-window)

// 레시피 분류 줄: 7칸씩 좌우로 넘기고(버튼·← → 키), 누르면 그 분류로 거름
const CategoryBar = ({ categories, selected, onSelect }) => {
    const [start, setStart] = useState(0); // 지금 맨 왼쪽에 보이는 분류 번호
    const maxStart = Math.max(0, categories.length - SHOW);

    // 7칸씩 넘기되 끝을 넘어가지 않게
    const move = (direction) => setStart((s) => Math.min(maxStart, Math.max(0, s + direction * SHOW)));

    const onKeyDown = (event) => {
        if (event.key !== "ArrowRight" && event.key !== "ArrowLeft") return;
        event.preventDefault();
        move(event.key === "ArrowRight" ? 1 : -1);
    };

    return (
        <section className="category" aria-label="레시피 분류" onKeyDown={onKeyDown}>
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
                                    onClick={() => onSelect(cat.id)}
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
    );
};

export default CategoryBar;
