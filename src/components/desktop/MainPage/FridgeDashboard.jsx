import { useNavigate } from "react-router";
import { useUpdateIngredient } from "../../../queries/ingredients";
import { useRecommendedRecipes } from "../../../queries/recipes";
import { addDays, getDaysLeft, getExpiryBadge } from "../../../utils/date";

const WEEKDAYS = ["일", "월", "화", "수", "목", "금", "토"];

const dayLabel = (key, i) => {
  if (i === 0) return "오늘";
  if (i === 1) return "내일";
  const [y, m, d] = key.split("-").map(Number);
  return `${m}.${d} (${WEEKDAYS[new Date(Date.UTC(y, m - 1, d)).getUTCDay()]})`;
};

// 데스크탑 메인 "지금 확인해야할 내 재료들" 아래: 급한 재료 목록 + 활용 레시피 + 이번 주 유통기한 달력
// items = summary.soon (기한 지남 ~ 6일 뒤, 수량 > 0). 재료를 바꾸면 요약은 queries/ingredients 가 다시 받음
const FridgeDashboard = ({ items, today }) => {
  const navigate = useNavigate();
  // 메인 모바일 추천과 같은 캐시. 받기 전 null, 실패하면 빈 목록
  const { data: recommended, isError } = useRecommendedRecipes();
  const recipes = recommended ? recommended.slice(0, 3) : isError ? [] : null;
  const { mutate: update, isPending, variables } = useUpdateIngredient();
  const busyId = isPending ? variables.id : null;

  // 기한 지남·D-day·임박(5일 이하)만. 서버가 기한 순으로 줌
  const urgent = items.filter((item) => getExpiryBadge(item.expiry_date, today).className === "is-urgent");
  const week = Array.from({ length: 7 }, (_, i) => {
    const key = addDays(today, i);
    return { key, label: dayLabel(key, i), items: items.filter((item) => item.expiry_date === key) };
  });

  // 다 먹었어요 = 수량 0 (다 떨어진 상품으로 옮겨감, 수정 화면에서 되돌릴 수 있음)
  const finish = (item) =>
    update(
      { id: item.id, body: { name: item.name, quantity: 0, unit: item.unit, storage: item.storage, expiryDate: item.expiry_date } },
      { onError: (e) => alert(`재료를 바꾸지 못했어요. ${e.message}`) },
    );

  return (
    <div className="dash">
      <div className="dash-row">
        <section className="dash-box dash-urgent" aria-labelledby="dash-urgent-title">
          <h3 id="dash-urgent-title" className="dash-title">급한 재료 {urgent.length}개</h3>
          {urgent.length === 0 ? (
            <p className="dash-empty">기한이 급한 재료가 없어요.</p>
          ) : (
            <table className="dash-table">
              <thead>
                <tr><th>재료</th><th>남은 기한</th><th>수량</th><th>보관</th><th aria-label="동작" /></tr>
              </thead>
              <tbody>
                {urgent.map((item) => {
                  const days = getDaysLeft(item.expiry_date, today);
                  return (
                    <tr key={item.id}>
                      <td>
                        <span className="dash-name">
                          {item.image_url && <img src={item.image_url} alt="" referrerPolicy="no-referrer" />}
                          {item.name}
                        </span>
                      </td>
                      <td>
                        <span className={`dash-badge ${days < 0 ? "is-expired" : "is-urgent"}`}>
                          {getExpiryBadge(item.expiry_date, today).label}
                        </span>
                      </td>
                      <td>{item.quantity} {item.unit}</td>
                      <td>{item.storage}</td>
                      <td>
                        <span className="dash-actions">
                          <button type="button" className="dash-btn primary" disabled={busyId === item.id} onClick={() => finish(item)}>
                            다 먹었어요
                          </button>
                          <button type="button" className="dash-btn" onClick={() => navigate(`/ingredient/edit/${item.id}`)}>
                            수정
                          </button>
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </section>

        <section className="dash-box dash-recipes" aria-labelledby="dash-recipes-title">
          <h3 id="dash-recipes-title" className="dash-title">냉장고 재료로 만들 수 있어요</h3>
          {!recipes ? (
            <p className="dash-empty">레시피를 고르는 중…</p>
          ) : recipes.length === 0 ? (
            <p className="dash-empty">추천할 레시피가 없어요.</p>
          ) : (
            <ul className="dash-recipe-list">
              {recipes.map((r) => (
                <li key={r.id}>
                  <button type="button" className="dash-recipe" onClick={() => navigate(`/recipe/${r.id}`)}>
                    <img src={r.image_url} alt="" referrerPolicy="no-referrer" loading="lazy" />
                    <span>
                      <strong>{r.title}</strong>
                      <small>{r.reason ? `'${r.reason}' 활용` : r.rating != null ? `★ ${r.rating} · 리뷰 ${r.review_count}개` : "새 레시피"}</small>
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>

      <section className="dash-box" aria-labelledby="dash-week-title">
        <h3 id="dash-week-title" className="dash-title">이번 주 유통기한</h3>
        <ol className="dash-week">
          {week.map((day) => (
            <li key={day.key} className={day.items.length ? "has-items" : undefined}>
              <span className="dash-day">{day.label}</span>
              {day.items.map((item) => (
                <button type="button" key={item.id} className="dash-chip" onClick={() => navigate(`/ingredient/edit/${item.id}`)}>
                  {item.name}
                </button>
              ))}
            </li>
          ))}
        </ol>
      </section>
    </div>
  );
};

export default FridgeDashboard;
