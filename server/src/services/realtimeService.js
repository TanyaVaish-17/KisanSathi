import Counter from "../models/Counter.js";
import { getIO } from "../socket.js";
import { calculateQueueState, suggestArrival } from "./queueService.js";

const idOf = (ref) => String(ref?._id ?? ref);

export const emitQueueUpdate = async (counterId, { finished = [] } = {}) => {
  const io = getIO();
  if (!io || !counterId) return;

  try {
    const state = await calculateQueueState(counterId);
    if (!state) return;

    const { counter, serving, entries } = state;
    const centerId = idOf(counter.center);
    const nowServing = serving ? serving.tokenCode : null;
    const delayed = counter.status !== "active";

    io.to(`center:${centerId}`).emit("queue:updated", {
      centerId,
      counterId: idOf(counter),
      counterName: counter.name,
      serviceId: idOf(counter.service),
      serviceName: counter.service.name,
      counterStatus: counter.status,
      nowServing,
      waitingCount: entries.length,
      updatedAt: new Date().toISOString(),
    });

    if (serving?.farmer) {
      io.to(`user:${idOf(serving.farmer)}`).emit("token:updated", {
        tokenId: idOf(serving),
        status: "serving",
        position: 0,
        aheadCount: 0,
        estimatedWaitMinutes: 0,
        nowServing,
        delayed,
        arrival: null,
      });
    }

    for (const entry of entries) {
      if (!entry.token.farmer) continue;

      io.to(`user:${idOf(entry.token.farmer)}`).emit("token:updated", {
        tokenId: idOf(entry.token),
        status: "waiting",
        position: entry.position,
        aheadCount: entry.aheadCount,
        estimatedWaitMinutes: entry.estimatedWaitMinutes,
        nowServing,
        delayed,
        arrival: suggestArrival(entry.estimatedWaitMinutes),
      });
    }

    for (const token of finished) {
      if (!token.farmer) continue;

      io.to(`user:${idOf(token.farmer)}`).emit("token:updated", {
        tokenId: idOf(token),
        status: token.status,
        position: null,
        aheadCount: 0,
        estimatedWaitMinutes: 0,
        nowServing: null,
        delayed: false,
        arrival: null,
      });
    }

    if (counter.operator) {
      io.to(`user:${idOf(counter.operator)}`).emit("operator:queue-changed", {
        counterId: idOf(counter),
      });
    }

    io.to("admins").emit("admin:queue-changed", { centerId, counterId: idOf(counter) });
  } catch (error) {
    console.error("Live update failed:", error.message);
  }
};

export const emitCenterUpdate = async (centerId) => {
  if (!getIO() || !centerId) return;

  try {
    const counters = await Counter.find({ center: centerId }).select("_id");
    await Promise.all(counters.map((counter) => emitQueueUpdate(counter._id)));
  } catch (error) {
    console.error("Live update failed:", error.message);
  }
};