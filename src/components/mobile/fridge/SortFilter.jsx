// 데스크탑 냉장고와 같은 거르기·정렬 (전체 = 기본 유통기한순). 모바일은 탭 하나만 고름
const filters = [
  { value: "all", label: "전체" },
  { value: "name", label: "이름순" },
  { value: "urgent", label: "임박" },
  { value: "expired", label: "지남" },
  { value: "condiment", label: "조미료" },
];

// 재료 거르기·정렬 탭. 밑줄(indicator)은 --filter-index 로 고른 탭 아래로 이동
const SortFilter = ({ value, onChange }) => (
  <div
    className="fridge-filters"
    role="group"
    aria-label="재료 거르기·정렬"
    style={{ "--filter-index": filters.findIndex((filter) => filter.value === value) }}
  >
    {filters.map((filter) => (
      <button
        key={filter.value}
        type="button"
        className={value === filter.value ? "is-active" : ""}
        aria-pressed={value === filter.value}
        onClick={() => onChange(filter.value)}
      >
        <span>{filter.label}</span>
      </button>
    ))}
    <span className="fridge-filter-indicator" aria-hidden="true" />
  </div>
);

export default SortFilter;
