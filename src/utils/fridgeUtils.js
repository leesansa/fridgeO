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

export function getExpiryBadge(expiryDate, today) {
  const daysLeft = getDaysLeft(expiryDate, today);

  return {
    label:
      daysLeft < 0
        ? `기한 ${Math.abs(daysLeft)}일 경과`
        : daysLeft === 0
          ? "D-day"
          : `D-${daysLeft}`,
    className: daysLeft <= 5 ? "is-urgent" : "is-safe",
  };
}

export function formatDate(dateString) {
  return dateString.replaceAll("-", ".");
}

export function filterAndSortIngredients(
  ingredients,
  keyword,
  sortBy,
) {
  const query = keyword.trim().toLocaleLowerCase("ko-KR");
  const storageOrder = { 냉장: 0, 냉동: 1, 실온: 2 };

  return ingredients
    .filter((item) =>
      item.name.toLocaleLowerCase("ko-KR").includes(query),
    )
    .sort((a, b) => {
      if (sortBy === "name") {
        return a.name.localeCompare(b.name, "ko");
      }

      if (sortBy === "storage") {
        return (
          storageOrder[a.storage] - storageOrder[b.storage] ||
          a.expiryDate.localeCompare(b.expiryDate)
        );
      }

      return a.expiryDate.localeCompare(b.expiryDate);
    });
}