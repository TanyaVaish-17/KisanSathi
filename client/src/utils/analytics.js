export const todayKey = () =>
  new Date().toLocaleDateString("en-CA", { timeZone: "Asia/Kolkata" });

export const shiftDateKey = (dateKey, days) => {
  const [year, month, day] = dateKey.split("-").map(Number);
  return new Date(Date.UTC(year, month - 1, day + days)).toISOString().slice(0, 10);
};

export const formatDay = (dateKey) =>
  new Date(`${dateKey}T00:00:00`).toLocaleDateString(undefined, { day: "numeric", month: "short" });

export const formatHour = (hour) => `${hour % 12 || 12}${hour >= 12 ? "pm" : "am"}`;

export const visibleHours = (peakHours) => {
  const used = peakHours.filter((item) => item.count > 0).map((item) => item.hour);
  const first = Math.max(0, (used.length ? Math.min(...used) : 8) - 1);
  const last = Math.min(23, (used.length ? Math.max(...used) : 18) + 1);
  return peakHours.filter((item) => item.hour >= first && item.hour <= last);
};