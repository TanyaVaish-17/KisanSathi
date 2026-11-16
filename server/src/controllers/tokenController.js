import Service from "../models/Service.js";
import ServiceCenter from "../models/ServiceCenter.js";
import Token, { ACTIVE_STATUSES } from "../models/Token.js";
import asyncHandler from "../utils/asyncHandler.js";
import { getDateKey } from "../utils/dateKey.js";
import { getNextTokenNumber } from "../utils/nextTokenNumber.js";
import { emitQueueUpdate } from "../services/realtimeService.js";
import {
  expireStaleTokens,
  getTokenQueueInfo,
  pickCounter,
  recalculateCounterQueue,
  suggestArrival,
} from "../services/queueService.js";

const populateToken = (token) =>
  token.populate([
    { path: "center", select: "name district" },
    { path: "service", select: "name nameHi estimatedDuration" },
    { path: "counter", select: "name" },
  ]);

export const createToken = asyncHandler(async (req, res) => {
  const [center, service] = await Promise.all([
    ServiceCenter.findOne({ _id: req.body.center, status: "active" }),
    Service.findOne({ _id: req.body.service, center: req.body.center, isActive: true }),
  ]);

  if (!center) {
    res.status(404);
    throw new Error("Center not found");
  }
  if (!service) {
    res.status(404);
    throw new Error("Service not found for this center");
  }
  await expireStaleTokens({ farmerId: req.user._id });

  const existingToken = await Token.exists({
    farmer: req.user._id,
    status: { $in: ACTIVE_STATUSES },
  });
  if (existingToken) {
    res.status(409);
    throw new Error("You already have an active token");
  }

  const dateKey = getDateKey();
  const counter = await pickCounter(center._id, service._id, dateKey);
  if (!counter) {
    res.status(400);
    throw new Error("No active counter is available for this service");
  }

  const tokenNumber = await getNextTokenNumber(center._id, dateKey);
  let token;
  try {
    token = await Token.create({
      tokenNumber,
      tokenCode: String(tokenNumber).padStart(3, "0"),
      dateKey,
      center: center._id,
      service: service._id,
      counter: counter._id,
      farmer: req.user._id,
      source: "online",
      estimatedServiceMinutes: service.averageDuration || service.estimatedDuration,
    });
  } catch (error) {
    if (error.code === 11000 && error.keyPattern?.farmer) {
      res.status(409);
      throw new Error("You already have an active token");
    }
    throw error;
  }

  await recalculateCounterQueue(counter._id, dateKey);
  emitQueueUpdate(counter._id);
  const queueInfo = await getTokenQueueInfo(token);
  token.estimatedWaitMinutes = queueInfo.estimatedWaitMinutes;
  token.estimatedStartAt = queueInfo.estimatedStartAt;
  token.estimatedCompletionAt = queueInfo.estimatedCompletionAt;
  token.etaUpdatedAt = queueInfo.etaUpdatedAt;
  await populateToken(token);

  res.status(201).json({
    success: true,
    token,
    queueInfo,
    arrivalAdvice: suggestArrival(queueInfo.estimatedWaitMinutes),
  });
});

export const getMyTokens = asyncHandler(async (req, res) => {
  await expireStaleTokens({ farmerId: req.user._id });
  const tokens = await Token.find({ farmer: req.user._id })
    .sort({ createdAt: -1 })
    .populate("center", "name district")
    .populate("service", "name nameHi estimatedDuration")
    .populate("counter", "name");

  const activeToken = tokens.find((token) => ACTIVE_STATUSES.includes(token.status)) || null;
  const pastTokens = tokens.filter((token) => !ACTIVE_STATUSES.includes(token.status));
  const queueInfo = activeToken ? await getTokenQueueInfo(activeToken) : null;

  res.json({
    success: true,
    activeToken,
    queueInfo,
    arrivalAdvice: queueInfo ? suggestArrival(queueInfo.estimatedWaitMinutes) : null,
    pastTokens,
  });
});

export const cancelToken = asyncHandler(async (req, res) => {
  const token = await Token.findOne({ _id: req.params.id, farmer: req.user._id });
  if (!token) {
    res.status(404);
    throw new Error("Token not found");
  }
  if (token.status !== "waiting") {
    res.status(400);
    throw new Error("Only waiting tokens can be cancelled");
  }

  token.status = "cancelled";
  token.cancelledAt = new Date();
  await token.save();

  if (token.counter) {
    await recalculateCounterQueue(token.counter, token.dateKey);
    emitQueueUpdate(token.counter, { finished: [token] });
  }

  res.json({ success: true, token });
});
