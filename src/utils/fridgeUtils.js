const DAY_MS = 24 * 60 * 60 * 1000;

export function getTodayKey(now = new Date()) {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: "Asia/Seoul",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(now);

  const values = Object.fromEntries(
    parts.map(({ type, value }) => [type, value]),
  );

  return `${values.year}-${values.month}-${values.day}`;
}

function getDayNumber(dateString) {
  const [year, month, day] = dateString.split("-").map(Number);

  return Date.UTC(year, month - 1, day) / DAY_MS;
}

export function getDaysLeft(expiryDate, today) {
  return getDayNumber(expiryDate) - getDayNumber(today);
}

// 남은 기한: D-3(3일 남음) → D-day(오늘까지) → D+2(2일 지남). 기한이 없는 재료는 "기한 없음"
export function getExpiryBadge(expiryDate, today) {
  if (!expiryDate) return { label: "기한 없음", className: "is-safe" };

  const daysLeft = getDaysLeft(expiryDate, today);

  return {
    label:
      daysLeft === 0
        ? "D-day"
        : daysLeft > 0
          ? `D-${daysLeft}`
          : `D+${-daysLeft}`,
    className: daysLeft <= 5 ? "is-urgent" : "is-safe",
  };
}

// "2026-11-30" → "~2026.11.30", 기한이 없으면 빈 글자
export function formatDate(dateString) {
  return dateString ? `~${dateString.replaceAll("-", ".")}` : "";
}
