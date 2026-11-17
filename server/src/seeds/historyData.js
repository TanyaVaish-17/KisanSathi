const SLOT_HOURS = [9, 9, 10, 10, 10, 11, 11, 11, 12, 12, 13, 14, 15, 16];
const FIRST_TOKEN_NUMBER = 500;

const createRandom = (seed) => {
  let state = seed >>> 0;
  return () => {
    state = (state + 0x6d2b79f5) >>> 0;
    let value = state;
    value = Math.imul(value ^ (value >>> 15), value | 1);
    value ^= value + Math.imul(value ^ (value >>> 7), value | 61);
    return ((value ^ (value >>> 14)) >>> 0) / 4294967296;
  };
};

const atMinutes = (dateKey, minutes) =>
  new Date(new Date(`${dateKey}T00:00:00+05:30`).getTime() + minutes * 60000);

export const buildHistory = ({ counters, farmers, dateKeys }) => {
  const random = createRandom(2026);
  const numbers = new Map();
  const docs = [];

  const nextNumber = (center, dateKey) => {
    const key = `${center}:${dateKey}`;
    const value = numbers.get(key) || FIRST_TOKEN_NUMBER;
    numbers.set(key, value + 1);
    return value;
  };

  dateKeys.forEach((dateKey) => {
    counters.forEach((counter) => {
      const count = 12 + Math.floor(random() * 14);
      const arrivals = Array.from({ length: count }, () => {
        const hour = SLOT_HOURS[Math.floor(random() * SLOT_HOURS.length)];
        return Math.min(counter.closeMin - 20, Math.max(counter.openMin, hour * 60 + Math.floor(random() * 60)));
      }).sort((a, b) => a - b);

      let freeAt = counter.openMin;

      for (const arrival of arrivals) {
        const roll = random();
        const useFarmer = farmers.length > 0 && random() < 0.6;
        const number = nextNumber(counter.center, dateKey);
        const queuedAt = atMinutes(dateKey, arrival);

        const base = {
          tokenNumber: number,
          tokenCode: String(number).padStart(3, "0"),
          dateKey,
          center: counter.center,
          service: counter.service,
          counter: counter._id,
          farmer: useFarmer ? farmers[Math.floor(random() * farmers.length)] : null,
          source: useFarmer ? "online" : "walk_in",
          isActive: false,
          queuedAt,
          estimatedWaitMinutes: 0,
          estimatedServiceMinutes: counter.duration,
          skipCount: 0,
          notes: "demo-history",
          createdAt: queuedAt,
          __v: 0,
        };

        if (!useFarmer) base.walkInName = `Demo Walk-in ${number}`;

        if (roll < 0.07) {
          const cancelledAt = atMinutes(dateKey, arrival + 3 + random() * 20);
          docs.push({ ...base, status: "cancelled", cancelledAt, updatedAt: cancelledAt });
          continue;
        }

        const start = Math.max(arrival, freeAt);
        if (start >= counter.closeMin) break;

        const called = atMinutes(dateKey, start);

        if (roll < 0.15) {
          const skippedAt = atMinutes(dateKey, start + 3);
          docs.push({
            ...base,
            status: "no_show",
            calledAt: called,
            skippedAt,
            updatedAt: skippedAt,
          });
          freeAt = start + 3;
          continue;
        }

        const duration = counter.duration * (0.6 + random() * 0.8);
        const end = start + duration;
        if (end > counter.closeMin) break;

        const completedAt = atMinutes(dateKey, end);
        docs.push({
          ...base,
          status: "completed",
          calledAt: called,
          servingStartedAt: called,
          completedAt,
          actualServiceMinutes: Math.round(duration * 100) / 100,
          updatedAt: completedAt,
        });
        freeAt = end;
      }
    });
  });

  return docs;
};