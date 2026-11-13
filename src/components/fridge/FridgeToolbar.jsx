import "../../vendor/lucian-icons/sort.js";
import "../../vendor/lucian-icons/grid.js";

// 정렬 탭 아래 줄: 왼쪽은 삭제하기/편집하기 모드 (다시 누르면 끔)와 조미료만 보기, 오른쪽은 목록형/박스형 보기
// onCondimentOnlyChange 가 없으면(내 조미료가 없음) 조미료 버튼을 안 보여 줌
const FridgeToolbar = ({ mode, onModeChange, viewMode, onViewModeChange, condimentOnly, onCondimentOnlyChange }) => {
  // 같은 모드를 다시 누르면 꺼짐
  const toggleMode = (next) => onModeChange(mode === next ? null : next);

  return (
    <div className="fridge-toolbar">
      <div className="fridge-actions">
        <button type="button" className="fridge-delete" aria-pressed={mode === "delete"} onClick={() => toggleMode("delete")}>
          {mode === "delete" ? "삭제 완료" : "삭제하기"}
        </button>
        <button type="button" className="fridge-edit" aria-pressed={mode === "edit"} onClick={() => toggleMode("edit")}>
          {mode === "edit" ? "선택 취소" : "편집하기"}
        </button>
        {onCondimentOnlyChange && (
          <button type="button" className="fridge-condiment" aria-pressed={condimentOnly} onClick={() => onCondimentOnlyChange(!condimentOnly)}>
            {condimentOnly ? "전체 보기" : "조미료"}
          </button>
        )}
      </div>

      <div className="fridge-view-buttons" style={{ backgroundColor: "transparent" }} role="group" aria-label="재료 표시 방식">
        <button
          type="button"
          className={viewMode === "list" ? "is-active" : ""}
          aria-label="목록형으로 보기"
          aria-pressed={viewMode === "list"}
          onClick={() => onViewModeChange("list")}
        >
          <lucian-sort tone="line" />
        </button>
        <button
          type="button"
          className={viewMode === "box" ? "is-active" : ""}
          aria-label="박스형으로 보기"
          aria-pressed={viewMode === "box"}
          onClick={() => onViewModeChange("box")}
        >
          <lucian-grid tone="line" />
        </button>
      </div>
    </div>
  );
};

export default FridgeToolbar;
