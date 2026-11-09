const STORAGE_KEY = "fridgeo:ingredient-edits";

function readEdits() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "{}") ?? {};
  } catch {
    return {};
  }
}

export function applyIngredientEdits(ingredients) {
  const edits = readEdits();

  return ingredients.map((item) => ({
    ...item,
    ...edits[item.id],
  }));
}

export function saveIngredientEdit(id, changes) {
  const edits = readEdits();

  localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify({ ...edits, [id]: changes }),
  );
}