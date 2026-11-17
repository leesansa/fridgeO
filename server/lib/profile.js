// 프로필 행이 아직 없으면(가입 직후 POST /api/me 실패 등) 만들어 둔다 → reviews·recipe_bookmarks 의 user_id 외래키 통과
export async function ensureProfile(sql, user) {
  await sql`INSERT INTO users (id, name) VALUES (${user.sub}, ${user.name ?? "사용자"}) ON CONFLICT (id) DO NOTHING`;
}
