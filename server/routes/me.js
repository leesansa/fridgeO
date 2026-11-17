// 내 정보: 프로필, 설정, 북마크, 내 레시피, 팔로우 현황 (모두 로그인 필요)
import { Hono } from "hono";
import { EXPIRY_ALERT_DAYS } from "../lib/constants.js";
import { HttpError, readJson } from "../lib/http.js";
import { ensureProfile } from "../lib/profile.js";
import { requireAuth } from "../middleware/auth.js";

const PROFILE_IMAGE_MAX = 150_000; // 프로필 사진 data URL 최대 글자 수 (브라우저에서 160px 로 줄이면 보통 10~20KB)

// 닉네임: 앞뒤 공백 제거 후 1~20자
export function parseName(value) {
  if (value === undefined) return undefined;
  const name = typeof value === "string" ? value.trim() : "";
  if (name.length < 1 || name.length > 20) throw new HttpError(400, "닉네임은 1~20자로 입력하세요");
  return name;
}

const me = new Hono();

// 내 프로필 + 마이페이지 숫자 (북마크·팔로잉·팔로워 수)
me.get("/api/me", requireAuth, async (c) => {
  const sql = c.get("sql");
  const user = c.get("user");
  const [profile] = await sql`
    SELECT id, name, profile_image_url, created_at, expiry_alert,
           (SELECT count(*)::int FROM recipe_bookmarks WHERE user_id = u.id) AS bookmark_count,
           (SELECT count(*)::int FROM follows WHERE user_id = u.id) AS following_count,
           (SELECT count(*)::int FROM follows WHERE following_id = u.id) AS follower_count,
           -- 유통기한 임박(5일 이하, 지난 것 포함) 내 재료. 알림 기준과 같음
           (SELECT COALESCE(json_agg(json_build_object(
                     'id', i.id, 'name', COALESCE(c.name, '재료'), 'expiry_date', to_char(i.expiry_date, 'YYYY-MM-DD'))
                   ORDER BY i.expiry_date, i.id), '[]')
            FROM ingredients i LEFT JOIN ingredient_catalog c ON c.id = i.catalog_id
            WHERE i.user_id = u.id AND i.quantity > 0 -- 수량 0 = 다 떨어진 재료는 뺌
              AND i.expiry_date <= (now() AT TIME ZONE 'Asia/Seoul')::date + ${EXPIRY_ALERT_DAYS}::int) AS urgent_ingredients
    FROM users u WHERE id = ${user.sub}`;
  if (!profile) throw new HttpError(404, "프로필이 없습니다");
  return c.json(profile);
});

// 닉네임 또는 프로필 사진 바꾸기. 브라우저에서 작게 줄인 사진을 data URL 글자로 받아 그대로 저장
// shortcut: data URL 을 users 행에 저장 (약 10KB), 사진 올리기(POST /api/images)로 옮기면 주소만 저장
me.patch("/api/me", requireAuth, async (c) => {
  const sql = c.get("sql");
  const user = c.get("user");
  const { profileImage, name } = await readJson(c, PROFILE_IMAGE_MAX + 1_000);
  // { name } 을 보내면 닉네임 바꾸기
  if (name !== undefined) {
    const nickname = parseName(name);
    await ensureProfile(sql, user);
    const [updated] = await sql`UPDATE users SET name = ${nickname} WHERE id = ${user.sub} RETURNING name`;
    return c.json(updated);
  }
  if (profileImage !== null) {
    const ok = typeof profileImage === "string" && profileImage.length <= PROFILE_IMAGE_MAX
      && /^data:image\/(jpeg|png|webp);base64,[A-Za-z0-9+/]+=*$/.test(profileImage);
    if (!ok) throw new HttpError(400, "사진은 150KB 이하의 JPG·PNG·WEBP 만 올릴 수 있어요");
  }
  await ensureProfile(sql, user);
  const [updated] = await sql`UPDATE users SET profile_image_url = ${profileImage} WHERE id = ${user.sub} RETURNING profile_image_url`;
  return c.json(updated);
});

// 알림 설정: 유통기한 임박 알림 받기 켜기/끄기
me.patch("/api/me/settings", requireAuth, async (c) => {
  const sql = c.get("sql");
  const user = c.get("user");
  const { expiryAlert } = await readJson(c, 1_000);
  if (typeof expiryAlert !== "boolean") throw new HttpError(400, "expiryAlert 는 true/false 여야 합니다");
  await ensureProfile(sql, user);
  const [updated] = await sql`UPDATE users SET expiry_alert = ${expiryAlert} WHERE id = ${user.sub} RETURNING expiry_alert`;
  return c.json(updated);
});

// 내가 북마크한 레시피 (최근 저장한 순)
me.get("/api/me/bookmarks", requireAuth, async (c) => {
  const sql = c.get("sql");
  return c.json(await sql`
    SELECT r.id, r.title, r.image_url, u.name AS author, s.review_count, s.rating
    FROM recipe_bookmarks b JOIN recipes r ON r.id = b.recipe_id
    LEFT JOIN users u ON u.id = r.user_id
    CROSS JOIN LATERAL (
      SELECT count(*)::int AS review_count, round(avg(rating), 1)::float AS rating
      FROM reviews WHERE recipe_id = r.id
    ) s
    WHERE b.user_id = ${c.get("user").sub}
    ORDER BY b.created_at DESC
    LIMIT 50`);
});

// 내가 쓴 레시피 (최근 쓴 순). 로그인한 계정(JWT sub)으로 작성한 것만
me.get("/api/me/recipes", requireAuth, async (c) => {
  const sql = c.get("sql");
  return c.json(await sql`SELECT id, title, image_url FROM recipes WHERE user_id = ${c.get("user").sub} ORDER BY created_at DESC, id DESC LIMIT 100`);
});

// 팔로우 현황. type=following(내가 팔로우한 사람, 기본) | followers(나를 팔로우한 사람)
me.get("/api/me/follows", requireAuth, async (c) => {
  const sql = c.get("sql");
  const user = c.get("user");
  const type = c.req.query("type") ?? "following";
  if (type !== "following" && type !== "followers") throw new HttpError(400, "type 이 올바르지 않습니다");
  return c.json(type === "following"
    ? await sql`SELECT u.id, u.name, u.profile_image_url FROM follows f JOIN users u ON u.id = f.following_id
                WHERE f.user_id = ${user.sub} ORDER BY f.created_at DESC LIMIT 100`
    : await sql`SELECT u.id, u.name, u.profile_image_url FROM follows f JOIN users u ON u.id = f.user_id
                WHERE f.following_id = ${user.sub} ORDER BY f.created_at DESC LIMIT 100`);
});

// 가입·로그인 직후 프로필 행을 만든다(이미 있으면 그대로). 닉네임이 없으면 가입 때 이름 사용
me.post("/api/me", requireAuth, async (c) => {
  const sql = c.get("sql");
  const user = c.get("user");
  const name = parseName((await readJson(c)).name) ?? user.name ?? "사용자";
  await sql`INSERT INTO users (id, name) VALUES (${user.sub}, ${name}) ON CONFLICT (id) DO NOTHING`;
  const [profile] = await sql`SELECT id, name, profile_image_url, created_at FROM users WHERE id = ${user.sub}`;
  return c.json(profile);
});

export default me;
