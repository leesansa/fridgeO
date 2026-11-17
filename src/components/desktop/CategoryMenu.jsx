import { useEffect, useId, useRef, useState } from "react";
import { Link, useLocation, useSearchParams } from "react-router";
import "../../vendor/lucian-icons/menu.js";
import CategoryIcon from "../mobile/Recipe/List/CategoryIcon.jsx";
import { getCategories } from "../../api/recipes";

const ALL = { id: null, name: "전체" };

// 데스크탑 헤더 "전체 카테고리": 누르면 레시피 분류가 아래로 세로로 펼쳐짐, 고르면 /recipe?category=id
// 처음 열 때 분류를 한 번 받음. 항목 클릭·Esc·바깥 클릭·Tab 으로 벗어나면 닫힘. 스타일은 DesktopHeader.css
const CategoryMenu = () => {
    const [open, setOpen] = useState(false);
    const [categories, setCategories] = useState(null); // 받기 전 null
    const rootRef = useRef(null);
    const buttonRef = useRef(null);
    const iconRef = useRef(null);
    const panelId = useId();
    const { pathname } = useLocation();
    const [searchParams] = useSearchParams();
    // 레시피 목록에 있으면 지금 분류를 표시 (null = 전체), 다른 화면이면 표시 안 함
    const current = pathname === "/recipe" ? searchParams.get("category") : undefined;

    // 메뉴 아이콘(lucian-icons 051 menu): 열림 = X, 닫힘 = 세 줄. state 는 읽기 전용이라 setState 로 바꿈
    useEffect(() => {
        iconRef.current.setState(open ? "open" : "closed");
    }, [open]);

    useEffect(() => {
        if (!open || categories) return;
        getCategories()
            .then((rows) => setCategories([ALL, ...rows]))
            .catch(() => setCategories([ALL])); // 실패해도 "전체"로는 갈 수 있게
    }, [open, categories]);

    useEffect(() => {
        if (!open) return;
        const onPointerDown = (e) => !rootRef.current.contains(e.target) && setOpen(false);
        const onKeyDown = (e) => {
            if (e.key !== "Escape") return;
            setOpen(false);
            buttonRef.current.focus();
        };
        document.addEventListener("pointerdown", onPointerDown);
        document.addEventListener("keydown", onKeyDown);
        return () => {
            document.removeEventListener("pointerdown", onPointerDown);
            document.removeEventListener("keydown", onKeyDown);
        };
    }, [open]);

    return (
        <div
            className="desk-category"
            ref={rootRef}
            onBlur={(e) => e.relatedTarget && !rootRef.current.contains(e.relatedTarget) && setOpen(false)}
        >
            <button
                ref={buttonRef}
                type="button"
                className="desk-category-btn"
                aria-expanded={open}
                aria-controls={open ? panelId : undefined}
                onClick={() => setOpen((o) => !o)}
            >
                <lucian-menu size="22" ref={iconRef} />
                전체 카테고리
            </button>
            {open && (
                <div id={panelId} className="desk-category-panel">
                    <p className="desk-category-title">레시피 <em>분류</em></p>
                    {!categories ? (
                        <p className="desk-category-status">분류를 불러오는 중…</p>
                    ) : (
                        <ul>
                            {categories.map((cat, i) => (
                                <li key={cat.id ?? "all"}>
                                    <Link
                                        to={cat.id ? `/recipe?category=${cat.id}` : "/recipe"}
                                        aria-current={current !== undefined && current === cat.id ? "page" : undefined}
                                        onClick={() => setOpen(false)}
                                    >
                                        <CategoryIcon cat={cat} index={i} />
                                        <span>{cat.name}</span>
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
            )}
        </div>
    );
};

export default CategoryMenu;
