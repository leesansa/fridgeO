// 알림센터 (모두 로그인 필요)
import { Hono } from "hono";
import { EXPIRY_ALERT_DAYS } from "../lib/constants.js";
import { requireAuth } from "../middleware/auth.js";

const notifications = new Hono();

// 내 알림 목록 + 안 읽은 수. 먼저 기한 5일 이하(지난 것 포함)인데 알림이 없는 내 재료의 유통기한 알림을 만든다
// (재료당 하나: notifications_expiry_once 인덱스라 동시에 불러도 중복 없음, 지운 알림도 행이 남아 다시 안 생김)
// shortcut: 따로 도는 예약 작업이 없어 목록을 볼 때 만듦, 푸시 알림이 필요해지면 Workers 의 Cron Trigger 로 옮길 것
notifications.get("/api/notifications", requireAuth, async (c) => {
  const sql = c.get("sql");
  const user = c.get("user");
  await sql`
    INSERT INTO notifications (user_id, type, message, ingredient_id)
    SELECT i.user_id, 'expiry', COALESCE(c.name, '재료') || '의 유통기한이 ' || to_char(i.expiry_date, 'YYYY-MM-DD') || '까지예요', i.id
    FROM ingredients i
    LEFT JOIN ingredient_catalog c ON c.id = i.catalog_id
    WHERE i.user_id = ${user.sub} AND i.quantity > 0 -- 다 떨어진 재료(수량 0)는 알림 안 만듦
      AND i.expiry_date <= (now() AT TIME ZONE 'Asia/Seoul')::date + ${EXPIRY_ALERT_DAYS}::int
      AND EXISTS (SELECT 1 FROM users WHERE id = ${user.sub} AND expiry_alert) -- 알림 설정에서 끈 사람은 새로 안 만듦
    ON CONFLICT (ingredient_id) WHERE type = 'expiry' DO NOTHING`;
  const items = await sql`
    SELECT n.id, n.type, n.message, n.created_at, n.read_at IS NOT NULL AS read,
           to_char(i.expiry_date, 'YYYY-MM-DD') AS expiry_date
    FROM notifications n
    LEFT JOIN ingredients i ON i.id = n.ingredient_id
    WHERE n.user_id = ${user.sub} AND n.dismissed_at IS NULL
    ORDER BY n.created_at DESC, i.expiry_date NULLS LAST, n.id DESC -- 한 번에 생긴 알림끼리는 기한 급한 것부터
    LIMIT 50`;
  return c.json({ items, unread: items.filter((n) => !n.read).length });
});

// 알림센터를 열면 모두 읽음
notifications.post("/api/notifications/read", requireAuth, async (c) => {
  await c.get("sql")`UPDATE notifications SET read_at = now() WHERE user_id = ${c.get("user").sub} AND read_at IS NULL`;
  return c.json({ ok: true });
});

// 전체삭제: 행은 남기고 지운 시각만 적음 (지우면 같은 재료 알림이 다음 조회 때 다시 생기므로)
notifications.delete("/api/notifications", requireAuth, async (c) => {
  await c.get("sql")`UPDATE notifications SET dismissed_at = now(), read_at = COALESCE(read_at, now()) WHERE user_id = ${c.get("user").sub} AND dismissed_at IS NULL`;
  return c.json({ ok: true });
});

export default notifications;
