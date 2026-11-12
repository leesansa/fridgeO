// 북마크 / 팔로우 숫자 (DB). 누르면 아래에 목록(StatPanel)이 펼쳐짐, 다시 누르면 접힘
const StatSummary = ({ me, openStat, onToggle }) => (
  <div className="mypage-card mypage-stats">
    {[
      ["bookmarks", "북마크", me ? `${me.bookmark_count}개` : "-"],
      ["follows", "팔로우", me ? me.following_count : "-"],
    ].map(([kind, label, value], i) => (
      <div key={kind} className="mypage-stat-slot">
        {i > 0 && <div className="mypage-stat-divider" />}
        <button
          type="button"
          className={`mypage-stat${openStat === kind ? " is-active" : ""}`}
          aria-expanded={openStat === kind}
          aria-controls="mypage-stat-panel"
          disabled={!me}
          onClick={() => onToggle(kind)}
        >
          <span className="mypage-stat-num">{value}</span>
          <span className="mypage-stat-label">{label} {openStat === kind ? "▴" : "▾"}</span>
        </button>
      </div>
    ))}
  </div>
);

export default StatSummary;
