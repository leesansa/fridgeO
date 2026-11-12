import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router";
import Header from "../components/Header";
import { apiFetch, isLoggedIn } from "../utils/auth";
import { getExpiryBadge, getTodayKey } from "../utils/fridgeUtils";
import "../styles/recipes.css";

// 통합 검색 (?q=): 내 냉장고 재료(로그인 시) + 레시피(제목·재료 이름) 를 한 번에 보여 줌. 각 목록은 첫 페이지만
const Search = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const q = searchParams.get("q")?.trim() ?? "";
  // 검색어별 결과. 결과의 q 가 지금 q 와 다르면 "찾는 중"
  const [result, setResult] = useState({ q: null });
  const [today] = useState(getTodayKey);

  useEffect(() => {
    if (!q) return;
    let alive = true;
    const query = new URLSearchParams({ q });
    Promise.all([
      apiFetch(`/api/recipes?${query}`),
      // 재료 검색은 30자까지, 로그인한 사람 것만
      isLoggedIn().then((ok) => (ok && q.length <= 30 ? apiFetch(`/api/ingredients?${query}`) : null)),
    ])
      .then(([recipes, ingredients]) => alive && setResult({ q, recipes, ingredients }))
      .catch((e) => alive && setResult({ q, error: e.message }));
    return () => { alive = false; };
  }, [q]);

  const loading = q && result.q !== q;

  return (
    <div className="recipe-page">
      <Header key={q} backTo="/" onSearch={(next) => setSearchParams(next ? { q: next } : {})} />

      <main style={styles.main}>
        {!q ? (
          <p style={styles.status}>레시피나 재료 이름을 입력해 주세요.</p>
        ) : loading ? (
          <p style={styles.status}>'{q}' 찾는 중…</p>
        ) : result.error ? (
          <p style={styles.status} role="alert">검색하지 못했어요. {result.error}</p>
        ) : (
          <>
            <section style={styles.card} aria-label="내 냉장고 재료">
              <h2 style={styles.title}>내 냉장고 재료</h2>
              {!result.ingredients ? (
                <button type="button" style={styles.more} onClick={() => navigate("/login")}>
                  로그인하면 내 냉장고 재료도 함께 찾아요 &gt;
                </button>
              ) : result.ingredients.items.length === 0 ? (
                <p style={styles.empty}>'{q}' 재료가 냉장고에 없어요.</p>
              ) : (
                <ul style={styles.list}>
                  {result.ingredients.items.map((item) => (
                    <li key={item.id}>
                      <button type="button" style={styles.row} onClick={() => navigate(`/ingredient/edit/${item.id}`)}>
                        <span>{item.name ?? "이름 없음"} <span style={styles.sub}>{item.quantity}{item.unit} · {item.storage}</span></span>
                        <span style={styles.sub}>{getExpiryBadge(item.expiry_date, today).label}</span>
                      </button>
                    </li>
                  ))}
                </ul>
              )}
              {result.ingredients?.nextOffset != null && (
                <button type="button" style={styles.more} onClick={() => navigate("/fridge")}>냉장고에서 더 보기 &gt;</button>
              )}
            </section>

            <section style={styles.card} aria-label="레시피">
              <h2 style={styles.title}>레시피</h2>
              {result.recipes.items.length === 0 ? (
                <p style={styles.empty}>'{q}'에 맞는 레시피가 없어요.</p>
              ) : (
                <ul style={styles.list}>
                  {result.recipes.items.map((r) => (
                    <li key={r.id}>
                      <button type="button" style={styles.row} onClick={() => navigate(`/recipe/${r.id}`)}>
                        <span style={styles.recipe}>
                          {r.image_url
                            ? <img src={r.image_url} alt="" referrerPolicy="no-referrer" style={styles.thumb} />
                            : <span style={styles.thumb} />}
                          {r.title}
                        </span>
                        {r.rating != null && <span style={styles.sub}>★ {r.rating}</span>}
                      </button>
                    </li>
                  ))}
                </ul>
              )}
              {result.recipes.nextCursor != null && (
                <button type="button" style={styles.more} onClick={() => navigate(`/recipe?${new URLSearchParams({ q })}`)}>
                  레시피 더 보기 &gt;
                </button>
              )}
            </section>
          </>
        )}
      </main>
    </div>
  );
};

const styles = {
  main: { padding: "16px 16px 90px", display: "flex", flexDirection: "column", gap: "14px" },
  status: { margin: "40px 0", textAlign: "center", fontSize: "14px", color: "#777" },
  card: { backgroundColor: "#FFF", borderRadius: "15px", padding: "16px 20px" },
  title: { margin: "0 0 8px", fontSize: "15px", fontWeight: 700, color: "#222" },
  empty: { margin: "6px 0", fontSize: "13px", color: "#777" },
  list: { margin: 0, padding: 0, listStyle: "none" },
  row: {
    display: "flex", justifyContent: "space-between", alignItems: "center", gap: "10px", width: "100%",
    padding: "10px 0", border: 0, borderBottom: "1px solid #F0F0F0", background: "none",
    font: "inherit", fontSize: "14px", textAlign: "left", color: "#222", cursor: "pointer",
  },
  recipe: { display: "flex", alignItems: "center", gap: "10px" },
  thumb: { width: "40px", height: "40px", flexShrink: 0, borderRadius: "8px", objectFit: "cover", backgroundColor: "#EEE" },
  sub: { flexShrink: 0, fontSize: "12px", color: "#777" },
  more: { marginTop: "8px", padding: 0, border: 0, background: "none", font: "inherit", fontSize: "13px", color: "#6E9952", cursor: "pointer" },
};

export default Search;
