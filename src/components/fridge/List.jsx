import {
  formatDate,
  getExpiryBadge,
} from "../../utils/fridgeUtils";

const List = ({ items, today, onSelectIngredient, onDeleteIngredient }) => {
  return (
    <ul className="ingredient-list">
      {items.map((item) => {
        const badge = getExpiryBadge(item.expiryDate, today);

        return (
          <li key={item.id} className="ingredient-row">
            <div className="ingredient-photo" aria-hidden="true">
              {item.image ? (
                <img src={item.image} alt="" />
              ) : (
                <span>{item.emoji}</span>
              )}
            </div>

            <div className="ingredient-info">
              <h2 className="ingredient-name">{item.name}</h2>

              <p className="ingredient-meta">
                <span>{item.quantity}</span>
                <span>{item.storage}</span>
              </p>

              <p className="ingredient-date">
                {formatDate(item.expiryDate)}
              </p>
            </div>

            <span className={`ingredient-badge ${badge.className}`}>
  {badge.label}
</span>

{onDeleteIngredient && (
  <button
    type="button"
    className="ingredient-delete-button"
    aria-label={`${item.name} 삭제`}
    onClick={() => onDeleteIngredient(item.id)}
  >
    <span aria-hidden="true">×</span>
  </button>
)}

{onSelectIngredient && (
  <button
    type="button"
    className="ingredient-edit-target"
    aria-label={`${item.name} 편집`}
    onClick={() => onSelectIngredient(item.id)}
  />
)}
</li>
        );
      })}
    </ul>
  );
};

export default List;