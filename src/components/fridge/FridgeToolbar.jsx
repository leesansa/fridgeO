import "../../vendor/lucian-icons/sort.js";
import "../../vendor/lucian-icons/grid.js";

// 정렬 탭 아래 줄: 왼쪽은 삭제하기/편집하기 모드 (다시 누르면 끔), 오른쪽은 목록형/박스형 보기
const FridgeToolbar = ({ mode, onModeChange, viewMode, onViewModeChange }) => {
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
