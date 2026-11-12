// 최근 본 레시피 (레시피 상세를 열 때마다 기록, 마이페이지에서 보여 줌)
// shortcut: 이 브라우저 저장소(localStorage)에만 기록 → 기기마다 따로이고 같은 브라우저의 다른 계정과 공유됨,
//           기기 간에 맞춰야 하면 DB 에 recipe_views 테이블을 만들어 옮길 것
const KEY = "fridgeo:recent-recipes";
const MAX = 10;

// [{ id, title, image_url }] 최신순. 저장소를 못 쓰거나 내용이 깨져 있으면 빈 목록
export function readRecentRecipes() {
  try {
    const list = JSON.parse(localStorage.getItem(KEY) ?? "[]");
    return Array.isArray(list) ? list.filter((r) => r && r.id && typeof r.title === "string") : [];
  } catch {
    return [];
  }
}

// 맨 앞에 넣고 같은 레시피는 한 번만, 최대 10개
export function addRecentRecipe({ id, title, image_url }) {
  try {
    const list = [
      { id: String(id), title, image_url: image_url ?? null },
      ...readRecentRecipes().filter((r) => r.id !== String(id)),
    ].slice(0, MAX);
    localStorage.setItem(KEY, JSON.stringify(list));
  } catch {
    // 저장소를 쓸 수 없으면(사생활 보호 모드 등) 기록만 건너뜀
  }
}
