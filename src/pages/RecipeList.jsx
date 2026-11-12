import { useEffect, useState } from "react";
import { useSearchParams } from "react-router";
import Header from "../components/Header.jsx";
import CategoryBar from "../components/Recipe/CategoryBar.jsx";
import RecipeCards from "../components/Recipe/RecipeCards.jsx";
import { apiFetch } from "../utils/auth.js";
import "../styles/recipes.css";

const ALL = { id: null, name: "전체" };

// 레시피 목록: 분류(DB)·고른 분류·검색어만 여기서 관리하고, 분류 줄과 카드 목록은 components/Recipe
const RecipeList = () => {
    const [categories, setCategories] = useState([ALL]);
    const [selected, setSelected] = useState(null); // 고른 분류 id, null = 전체

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

    return (
        <div className="recipe-page">
            <CategoryBar categories={categories} selected={selected} onSelect={setSelected} />
            <Header value={text} onChange={setText} />
            <RecipeCards key={`${selected ?? "all"}|${q}`} categoryId={selected} q={q} />
        </div>
    );
};

export default RecipeList;
