import ServiceCenter from "../models/ServiceCenter.js";
import Service from "../models/Service.js";
import Counter from "../models/Counter.js";
import { calculateQueueState } from "./queueService.js";
import { getIstClock } from "../utils/dateKey.js";

const escapeRegex = (text) => text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const toMinutes = (time) => {
  const [h, m] = time.split(":").map(Number);
  return h * 60 + m;
};

const isOpenNow = (center, clock) =>
  center.workingDays.includes(clock.day) &&
  clock.minutes >= toMinutes(center.openTime) &&
  clock.minutes < toMinutes(center.closeTime);

const minutesLeft = (center, clock) => {
  if (process.env.ENFORCE_CENTER_HOURS !== "true") {
    return toMinutes(center.closeTime) - toMinutes(center.openTime);
  }
  if (!isOpenNow(center, clock)) return 0;
  return toMinutes(center.closeTime) - clock.minutes;
};

export const getCenterComparison = async ({ serviceName, district } = {}) => {
  const centerFilter = { status: "active" };
  if (district) centerFilter.district = new RegExp(`^${escapeRegex(district)}$`, "i");

  const centers = await ServiceCenter.find(centerFilter);

  const serviceFilter = { center: { $in: centers.map((c) => c._id) }, isActive: true };
  if (serviceName) serviceFilter.name = new RegExp(`^${escapeRegex(serviceName)}$`, "i");

  const services = await Service.find(serviceFilter).sort("name");
  const counters = await Counter.find({
    service: { $in: services.map((s) => s._id) },
    status: "active",
  });

  const states = await Promise.all(counters.map((counter) => calculateQueueState(counter._id)));
  const loadByCounter = new Map(
    states.filter(Boolean).map((state) => [
      String(state.counter._id),
      {
        people: state.entries.length + (state.serving ? 1 : 0),
        wait: state.servingRemaining + state.entries.length * state.duration,
      },
    ])
  );

  const clock = getIstClock();

  const results = centers
    .map((center) => {
      const left = minutesLeft(center, clock);

      const centerServices = services
        .filter((service) => String(service.center) === String(center._id))
        .map((service) => {
          const loads = counters
            .filter((counter) => String(counter.service) === String(service._id))
            .map((counter) => loadByCounter.get(String(counter._id)))
            .filter(Boolean);

          const base = {
            serviceId: service._id,
            name: service.name,
            nameHi: service.nameHi,
            estimatedDuration: service.estimatedDuration,
          };

          if (loads.length === 0) {
            return {
              ...base,
              activeCounters: 0,
              peopleInQueue: 0,
              estimatedWaitMinutes: null,
              availableSlots: 0,
            };
          }

          const people = loads.reduce((sum, load) => sum + load.people, 0);
          const capacity = Math.floor(left / service.estimatedDuration) * loads.length;

          return {
            ...base,
            activeCounters: loads.length,
            peopleInQueue: people,
            estimatedWaitMinutes: Math.min(...loads.map((load) => load.wait)),
            availableSlots: Math.max(0, capacity - people),
          };
        });

      const bookable = centerServices.filter((s) => s.activeCounters > 0 && s.availableSlots > 0);

      return {
        id: center._id,
        name: center.name,
        type: center.type,
        address: center.address,
        district: center.district,
        openTime: center.openTime,
        closeTime: center.closeTime,
        workingDays: center.workingDays,
        isOpenNow: isOpenNow(center, clock),
        services: centerServices,
        estimatedWaitMinutes: bookable.length
          ? Math.min(...bookable.map((s) => s.estimatedWaitMinutes))
          : null,
        availableSlots: bookable.reduce((sum, s) => sum + s.availableSlots, 0),
        recommended: false,
      };
    })
    .filter((center) => center.services.length > 0);

  results.sort((a, b) => {
    if (a.estimatedWaitMinutes === null && b.estimatedWaitMinutes === null) {
      return a.name.localeCompare(b.name);
    }
    if (a.estimatedWaitMinutes === null) return 1;
    if (b.estimatedWaitMinutes === null) return -1;
    return a.estimatedWaitMinutes - b.estimatedWaitMinutes || a.name.localeCompare(b.name);
  });

  if (serviceName && results.length > 0 && results[0].estimatedWaitMinutes !== null) {
    results[0].recommended = true;
  }

  return {
    count: results.length,
    recommendedCenterId: results.find((c) => c.recommended)?.id || null,
    centers: results,
  };
};