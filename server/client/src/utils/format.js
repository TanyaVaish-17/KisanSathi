const DAY_NAMES = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

const toMinutes = (time) => {
  const [h, m] = time.split(":").map(Number);
  return h * 60 + m;
};

export const formatTime = (time) => {
  const [h, m] = time.split(":").map(Number);
  const suffix = h >= 12 ? "PM" : "AM";
  return `${h % 12 || 12}:${String(m).padStart(2, "0")} ${suffix}`;
};

export const formatDays = (days) => {
  const sorted = [...days].sort((a, b) => a - b);
  if (sorted.join() === "1,2,3,4,5,6") return "Mon – Sat";
  if (sorted.length === 7) return "Every day";
  return sorted.map((d) => DAY_NAMES[d]).join(", ");
};

export const isOpenNow = (center) => {
  const now = new Date();
  if (!center.workingDays.includes(now.getDay())) return false;
  const current = now.getHours() * 60 + now.getMinutes();
  return current >= toMinutes(center.openTime) && current < toMinutes(center.closeTime);
};

export const centerTypeLabel = (type) =>
  type === "procurement_center" ? "Procurement Center" : "Mandi";