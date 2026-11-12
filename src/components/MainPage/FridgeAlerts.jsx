import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router";
import { apiFetch, isLoggedIn } from "../../utils/auth";
import { getExpiryBadge, getTodayKey } from "../../utils/fridgeUtils";
import line from "../../assets/main/line.svg";
import chevron from "../../assets/main/chevron.png";
import expiry from "../../assets/main/expiry.png";
import restock from "../../assets/main/restock.png";
import expired from "../../assets/main/expired.svg";
import soonestIcon from "../../assets/main/soonest.svg";

const ICON_POS = { left: 127, top: 25 };

// "N개 있음" 카드: 1개 이상이면 확인!, 없으면 정상
const countCard = (title, n, icon, iconPos = ICON_POS) => ({
  title, icon, iconPos,
  ...(n > 0 ? { status: "확인!", tone: "warn", desc: `${n}개 있음` } : { status: "정상", tone: "ok", desc: "없음" }),
});

// DB 요약(GET /api/fridge/summary) → 카드 4개. summary 가 없으면(불러오는 중·로그아웃) 안내 문구
function toCards(summary, today, loggedIn) {
  if (!summary) {
    const desc = loggedIn === false ? "로그인 후 확인" : "불러오는 중…";
    return [["유통기한 임박", expiry], ["유통기한 지남", expired], ["다 떨어진 상품", restock], ["가장 급한 재료", soonestIcon]]
      .map(([title, icon]) => ({ title, icon, iconPos: ICON_POS, status: "", tone: "ok", desc }));
  }
  const { soonest } = summary;
  const soonestBadge = soonest && getExpiryBadge(soonest.expiry_date, today);
  return [
    countCard("유통기한 임박", summary.urgent, expiry),
    countCard("유통기한 지남", summary.expired, expired),
    countCard("다 떨어진 상품", summary.empty, restock, { left: 128, top: 24 }),
    soonest
      ? {
          title: soonest.name,
          desc: `${soonestBadge.label} · ${soonest.expiry_date.slice(5).replace("-", ".")}까지`,
          ...(soonestBadge.className === "is-urgent" ? { status: "확인!", tone: "warn" } : { status: "정상", tone: "ok" }),
          icon: soonestIcon,
          iconPos: ICON_POS,
        }
      : { title: "가장 급한 재료", desc: "기한 있는 재료 없음", status: "정상", tone: "ok", icon: soonestIcon, iconPos: ICON_POS },
  ];
}

// 메인 "지금 확인해야할 내 재료들": 메인에 들어올 때마다 DB 에서 새로 받아 와서 항상 최신 상태
const FridgeAlerts = () => {
  const navigate = useNavigate();
  const [loggedIn, setLoggedIn] = useState(null); // 확인 전 null
  const [summary, setSummary] = useState(null);
  const [today] = useState(getTodayKey);

  useEffect(() => {
    let alive = true;
    isLoggedIn().then(async (ok) => {
      if (!alive) return;
      setLoggedIn(ok);
      if (!ok) return;
      try {
        const data = await apiFetch("/api/fridge/summary");
        if (alive) setSummary(data);
      } catch (e) {
        console.error("냉장고 요약을 불러오지 못했습니다:", e);
      }
    });
    return () => { alive = false; };
  }, []);

  return (
    <section className="main-section fridge-section">
      <h2 className="section-title fridge-title">지금 확인해야할 내 재료들!</h2>
      <img className="divider" src={line} alt="" />
      <div className="fridge-grid">
        {toCards(summary, today, loggedIn).map((card) => (
          <button
            type="button"
            className="fridge-card"
            key={card.title}
            onClick={() => navigate(loggedIn === false ? "/login" : "/fridge")}
          >
            <span className={`fridge-status ${card.tone}`}>{card.status}</span>
            <span className="fridge-name">{card.title}</span>
            <span className="fridge-desc">{card.desc}</span>
            <img className="fridge-icon" src={card.icon} alt="" style={card.iconPos} />
          </button>
        ))}
      </div>
      <img className="divider" src={line} alt="" />
      <Link to="/fridge" className="fridge-more">
        <span className="fridge-more-text">
          <strong>냉장고관리 </strong>에서 더보기
        </span>
        <img className="chevron" src={chevron} alt="" />
      </Link>
    </section>
  );
};

export default FridgeAlerts;
