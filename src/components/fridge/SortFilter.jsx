const filters = [
  { value: "expiry", label: "유통기한순" },
  { value: "name", label: "재료 이름순" },
  { value: "storage", label: "보관 장소순" },
];

// 재료 정렬 탭 (유통기한순 · 재료 이름순 · 보관 장소순). 밑줄(indicator)은 --filter-index 로 고른 탭 아래로 이동
const SortFilter = ({ sortBy, onChange }) => (
  <div
    className="fridge-filters"
    role="group"
    aria-label="재료 정렬 기준"
    style={{ "--filter-index": filters.findIndex((filter) => filter.value === sortBy) }}
  >
    {filters.map((filter) => (
      <button
        key={filter.value}
        type="button"
        className={sortBy === filter.value ? "is-active" : ""}
        aria-pressed={sortBy === filter.value}
        onClick={() => onChange(filter.value)}
      >
        <span>{filter.label}</span>
      </button>
    ))}
    <span className="fridge-filter-indicator" aria-hidden="true" />
  </div>
);

export default SortFilter;
