// 내 냉장고: 재료 CRUD, 메인 요약, 조미료, 재료 사전
import { Hono } from "hono";
import { EXPIRY_ALERT_DAYS } from "../lib/constants.js";
import { HttpError, idParam, readJson } from "../lib/http.js";
import { ensureProfile } from "../lib/profile.js";
import { requireAuth } from "../middleware/auth.js";

const INGREDIENT_PAGE = 10;
const NOT_FOUND = "재료를 찾을 수 없습니다";

// "YYYY-MM-DD" 이고 실제로 있는 날짜인지. 2026-02-30 은 3월로 넘어가 원래 글자와 달라지고, 2026-13-01 은 NaN
export function isDateKey(value) {
  if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const time = Date.parse(`${value}T00:00:00Z`);
  return !Number.isNaN(time) && new Date(time).toISOString().startsWith(value);
}

// 재료 추가·수정 입력 검사 → { name, quantity, unit, storage, expiryDate }
// 수정할 때는 수량 0 허용 (다 쓴 재료를 지우지 않고 남겨 두면 메인 "다 떨어진 상품"에 잡힘)
export function parseIngredient(body, { allowZero = false } = {}) {
  const name = typeof body.name === "string" ? body.name.trim() : "";
  if (name.length < 1 || name.length > 30) throw new HttpError(400, "재료 이름은 1~30자로 입력하세요");
  const quantity = Number(body.quantity);
  if (!Number.isFinite(quantity) || quantity < 0 || (quantity === 0 && !allowZero) || quantity > 9999) {
    throw new HttpError(400, allowZero ? "수량은 0 이상 9999 이하로 입력하세요" : "수량은 0보다 크고 9999 이하로 입력하세요");
  }
  const unit = typeof body.unit === "string" && body.unit.trim() ? body.unit.trim().slice(0, 10) : "개";
  if (!["냉장", "냉동", "실온"].includes(body.storage)) throw new HttpError(400, "보관 방법을 골라 주세요");
  const expiryDate = body.expiryDate || null;
  if (expiryDate !== null && !isDateKey(expiryDate)) throw new HttpError(400, "유통기한 날짜가 올바르지 않습니다");
  return { name, quantity, unit, storage: body.storage, expiryDate };
}

// ingredients 에는 이름 칸이 없어서, 이름으로 재료 사전(ingredient_catalog)을 찾고 없으면 등록한 뒤 그 id
// (DO UPDATE 로 두어야 이미 있는 이름일 때도 RETURNING 이 기존 행을 돌려줌)
async function catalogIdFor(sql, name) {
  const [catalog] = await sql`
    INSERT INTO ingredient_catalog (name) VALUES (${name})
    ON CONFLICT (name) DO UPDATE SET name = EXCLUDED.name
    RETURNING id`;
  return catalog.id;
}

const ingredients = new Hono();

// 재료 사전 [{ name, shelf_life_days }] (로그인 불필요): 등록 화면의 이름 자동완성 + 유통기한 기본값(오늘 + 보관 일수)
// 보관 일수가 있는 = 검수된 항목만 (사용자가 새로 입력해 생긴 이름은 오타·중복이 섞여 있어 추천하지 않음)
ingredients.get("/api/ingredient-catalog", async (c) => {
  return c.json(await c.get("sql")`SELECT name, shelf_life_days FROM ingredient_catalog WHERE shelf_life_days IS NOT NULL ORDER BY name`);
});

// 내 냉장고 재료 (무한 스크롤). sort = expiry(기본)|name|storage, q = 재료 이름 검색, offset = 이미 받은 개수
// shortcut: OFFSET 페이지라 한 사람 재료가 수천 개가 되면 느려짐, 그때 정렬 기준별 커서로 교체
ingredients.get("/api/ingredients", requireAuth, async (c) => {
  const params = new URL(c.req.url).searchParams;
  const sort = params.get("sort") ?? "expiry";
  if (!["expiry", "name", "storage"].includes(sort)) throw new HttpError(400, "sort 가 올바르지 않습니다");
  const offset = Number(params.get("offset") ?? 0);
  if (!Number.isSafeInteger(offset) || offset < 0) throw new HttpError(400, "offset 이 올바르지 않습니다");
  const q = params.get("q")?.trim() || null;
  if (q && q.length > 30) throw new HttpError(400, "검색어는 30자 이하로 입력하세요");
  const pattern = q && `%${q.replace(/[\\%_]/g, "\\$&")}%`;
  const category = params.get("category") || null; // "조미료" 면 조미료만
  // 데스크탑 냉장고: storage = 냉장|냉동|실온 칸, status = urgent(임박 0~5일)|expired(지남)|empty(다 떨어짐). 메인 요약 카드와 같은 기준
  const storage = params.get("storage") || null;
  if (storage && !["냉장", "냉동", "실온"].includes(storage)) throw new HttpError(400, "storage 가 올바르지 않습니다");
  const status = params.get("status") || null;
  if (status && !["urgent", "expired", "empty"].includes(status)) throw new HttpError(400, "status 가 올바르지 않습니다");
  // 날짜는 시간대 영향 없게 'YYYY-MM-DD' 글자로, 수량은 1.50 → 1.5 처럼 끝 0 제거. 사진이 없는 조미료는 아이콘으로 대신
  // total = 같은 조건의 전체 개수 (LIMIT 전에 셈)
  const rows = await c.get("sql")`
    SELECT i.id, c.name, COALESCE(c.image_url, c.icon_url) AS image_url, trim_scale(i.quantity)::text AS quantity, i.unit, i.storage,
           to_char(i.expiry_date, 'YYYY-MM-DD') AS expiry_date,
           to_char(i.created_at AT TIME ZONE 'Asia/Seoul', 'YYYY-MM-DD') AS created_at,
           count(*) OVER ()::int AS total
    FROM ingredients i
    LEFT JOIN ingredient_catalog c ON c.id = i.catalog_id
    CROSS JOIN (SELECT (now() AT TIME ZONE 'Asia/Seoul')::date AS d) t
    WHERE i.user_id = ${c.get("user").sub} AND (${pattern}::text IS NULL OR c.name ILIKE ${pattern})
      AND (${category}::text IS NULL OR c.category = ${category})
      AND (${storage}::text IS NULL OR i.storage = ${storage})
      AND (${status}::text IS NULL
           OR (${status}::text = 'urgent' AND i.quantity > 0 AND i.expiry_date BETWEEN t.d AND t.d + ${EXPIRY_ALERT_DAYS}::int)
           OR (${status}::text = 'expired' AND i.quantity > 0 AND i.expiry_date < t.d)
           OR (${status}::text = 'empty' AND i.quantity = 0))
    ORDER BY
      CASE WHEN ${sort} = 'name' THEN c.name END,
      CASE WHEN ${sort} = 'storage' THEN array_position(ARRAY['냉장', '냉동', '실온'], i.storage) END,
      i.expiry_date NULLS LAST, i.id
    LIMIT ${INGREDIENT_PAGE + 1} OFFSET ${offset}`;
  const total = rows[0]?.total ?? (offset === 0 ? 0 : null); // 끝을 넘긴 페이지는 개수를 모름
  for (const row of rows) delete row.total;
  return c.json({ items: rows.slice(0, INGREDIENT_PAGE), total, nextOffset: rows.length > INGREDIENT_PAGE ? offset + INGREDIENT_PAGE : null });
});

// 내가 가진 조미료 (메인 "내 조미료들", 냉장고 조미료 탭 표시 여부). 같은 조미료가 여러 개여도 한 번, 다 떨어진 것(수량 0)은 뺌
ingredients.get("/api/fridge/condiments", requireAuth, async (c) => {
  return c.json(await c.get("sql")`
    SELECT DISTINCT c.name, c.icon_url
    FROM ingredients i JOIN ingredient_catalog c ON c.id = i.catalog_id
    WHERE i.user_id = ${c.get("user").sub} AND i.quantity > 0 AND c.category = '조미료'
    ORDER BY c.name`);
});

// 메인 "지금 확인해야할 내 재료들" 요약: 임박(0~5일)·기한 지남·다 떨어짐(수량 0) 개수 + 기한이 가장 빠른 재료
// 수량 0 인 재료는 냉장고에 없는 것으로 보고 임박·지남·가장 급한 재료에서 뺀다
ingredients.get("/api/fridge/summary", requireAuth, async (c) => {
  const user = c.get("user");
  const [summary] = await c.get("sql")`
    WITH today AS (SELECT (now() AT TIME ZONE 'Asia/Seoul')::date AS d)
    SELECT
      count(*) FILTER (WHERE i.quantity > 0 AND i.expiry_date BETWEEN t.d AND t.d + ${EXPIRY_ALERT_DAYS}::int)::int AS urgent,
      count(*) FILTER (WHERE i.quantity > 0 AND i.expiry_date < t.d)::int AS expired,
      count(*) FILTER (WHERE i.quantity = 0)::int AS empty,
      (SELECT json_build_object('name', COALESCE(c.name, '재료'), 'expiry_date', to_char(s.expiry_date, 'YYYY-MM-DD'))
       FROM ingredients s LEFT JOIN ingredient_catalog c ON c.id = s.catalog_id
       WHERE s.user_id = ${user.sub} AND s.quantity > 0 AND s.expiry_date >= t.d
       ORDER BY s.expiry_date, s.id LIMIT 1) AS soonest,
      -- 데스크탑 대시보드: 기한 지난 것 ~ 6일 뒤까지 재료 (급한 재료 목록 + 이번 주 달력)
      -- shortcut: 오래 지난 재료가 30개를 넘으면 이번 주 재료가 잘림, 그러면 지남/이번 주를 따로 받을 것
      (SELECT COALESCE(json_agg(x ORDER BY x.expiry_date, x.id), '[]')
       FROM (SELECT s.id, COALESCE(c.name, '재료') AS name, COALESCE(c.image_url, c.icon_url) AS image_url,
                    trim_scale(s.quantity)::text AS quantity, s.unit, s.storage,
                    to_char(s.expiry_date, 'YYYY-MM-DD') AS expiry_date
             FROM ingredients s LEFT JOIN ingredient_catalog c ON c.id = s.catalog_id
             WHERE s.user_id = ${user.sub} AND s.quantity > 0 AND s.expiry_date <= t.d + 6
             ORDER BY s.expiry_date, s.id LIMIT 30) x) AS soon
    FROM today t LEFT JOIN ingredients i ON i.user_id = ${user.sub}
    GROUP BY t.d`;
  return c.json(summary);
});

// 내 냉장고에 재료 추가
ingredients.post("/api/ingredients", requireAuth, async (c) => {
  const sql = c.get("sql");
  const user = c.get("user");
  const input = parseIngredient(await readJson(c));
  await ensureProfile(sql, user);
  const catalogId = await catalogIdFor(sql, input.name);
  const [row] = await sql`
    INSERT INTO ingredients (user_id, catalog_id, quantity, unit, storage, expiry_date)
    VALUES (${user.sub}, ${catalogId}, ${input.quantity}, ${input.unit}, ${input.storage}, ${input.expiryDate})
    RETURNING id`;
  return c.json({ id: row.id });
});

// 내 재료 하나 (편집 화면용). 다른 사람 재료는 없는 것처럼 404
ingredients.get("/api/ingredients/:id{[0-9]+}", requireAuth, async (c) => {
  const [row] = await c.get("sql")`
    SELECT i.id, c.name, trim_scale(i.quantity)::text AS quantity, i.unit, i.storage,
           to_char(i.expiry_date, 'YYYY-MM-DD') AS expiry_date
    FROM ingredients i
    LEFT JOIN ingredient_catalog c ON c.id = i.catalog_id
    WHERE i.id = ${idParam(c, NOT_FOUND)} AND i.user_id = ${c.get("user").sub}`;
  if (!row) throw new HttpError(404, NOT_FOUND);
  return c.json(row);
});

// 내 재료 수정 (추가와 같은 검사, 단 수량 0 = 다 떨어짐 허용)
ingredients.patch("/api/ingredients/:id{[0-9]+}", requireAuth, async (c) => {
  const sql = c.get("sql");
  const user = c.get("user");
  const id = idParam(c, NOT_FOUND);
  const input = parseIngredient(await readJson(c), { allowZero: true });
  const catalogId = await catalogIdFor(sql, input.name);
  // 고치기 전 기한(old)과 비교해 기한이 바뀌었는지도 함께 돌려받음
  const rows = await sql`
    UPDATE ingredients i
    SET catalog_id = ${catalogId}, quantity = ${input.quantity}, unit = ${input.unit},
        storage = ${input.storage}, expiry_date = ${input.expiryDate}
    FROM (SELECT id, expiry_date FROM ingredients WHERE id = ${id} AND user_id = ${user.sub} FOR UPDATE) old
    WHERE i.id = old.id
    RETURNING i.id, old.expiry_date IS DISTINCT FROM i.expiry_date AS expiry_changed`;
  if (rows.length === 0) throw new HttpError(404, NOT_FOUND);
  // 기한이 바뀌면 예전 날짜로 만든 유통기한 알림을 지움 → 다음 알림 조회 때 새 날짜로 다시 판단
  if (rows[0].expiry_changed) await sql`DELETE FROM notifications WHERE type = 'expiry' AND ingredient_id = ${id}`;
  return c.json({ id: rows[0].id });
});

// 내 재료 삭제 (다른 사람 재료는 user_id 조건에 걸려 지워지지 않음)
ingredients.delete("/api/ingredients/:id{[0-9]+}", requireAuth, async (c) => {
  const rows = await c.get("sql")`DELETE FROM ingredients WHERE id = ${idParam(c, NOT_FOUND)} AND user_id = ${c.get("user").sub} RETURNING id`;
  if (rows.length === 0) throw new HttpError(404, NOT_FOUND);
  return c.json({ ok: true });
});

export default ingredients;
