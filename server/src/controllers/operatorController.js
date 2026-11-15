import Counter from "../models/Counter.js";
import Service from "../models/Service.js";
import Token from "../models/Token.js";
import asyncHandler from "../utils/asyncHandler.js";
import { getDateKey } from "../utils/dateKey.js";
import {
  calculateQueueState,
  getTokenQueueInfo,
  pickCounter,
  recalculateCounterQueue,
  releaseStaleCounterToken,
  MAX_SKIPS,
} from "../services/queueService.js";
import { nextTokenNumber, buildTokenCode } from "../services/tokenService.js";

const COUNTER_POPULATE = [
  { path: "center", select: "name district" },
  { path: "service", select: "name estimatedDuration" },
];

const FARMER_POPULATE = { path: "farmer", select: "name phone village" };

const CLOSED_AT_FIELD = {
  completed: "completedAt",
  skipped: "skippedAt",
  no_show: "skippedAt",
};

const findOwnCounter = async (req, res) => {
  const counter = await Counter.findOne({ operator: req.user._id });
  if (!counter) {
    res.status(404);
    throw new Error("No counter is assigned to you yet. Please contact the admin");
  }
  return counter;
};

const formatToken = (token) => ({
  id: token._id,
  tokenCode: token.tokenCode,
  tokenNumber: token.tokenNumber,
  status: token.status,
  source: token.source,
  name: token.farmer?.name || token.walkInName,
  phone: token.farmer?.phone || token.walkInPhone,
  skipCount: token.skipCount,
  queuedAt: token.queuedAt,
  calledAt: token.calledAt,
  servingStartedAt: token.servingStartedAt,
});

export const getQueue = asyncHandler(async (req, res) => {
  const counter = await findOwnCounter(req, res);
  await counter.populate(COUNTER_POPULATE);

  const dateKey = getDateKey();
  const state = await calculateQueueState(counter._id, dateKey);

  const tokens = [state.serving, ...state.entries.map((e) => e.token)].filter(Boolean);
  await Token.populate(tokens, FARMER_POPULATE);

  const totals = await Token.aggregate([
    { $match: { counter: counter._id, dateKey } },
    { $group: { _id: "$status", count: { $sum: 1 } } },
  ]);
  const count = (status) => totals.find((t) => t._id === status)?.count || 0;

  res.json({
    success: true,
    counter: {
      id: counter._id,
      name: counter.name,
      status: counter.status,
      center: counter.center,
      service: counter.service,
    },
    serving: state.serving
      ? { ...formatToken(state.serving), minutesLeft: state.servingRemaining }
      : null,
    waiting: state.entries.map((entry) => ({
      ...formatToken(entry.token),
      position: entry.position,
      estimatedWaitMinutes: entry.estimatedWaitMinutes,
    })),
    today: {
      waiting: state.entries.length,
      completed: count("completed"),
      skipped: count("skipped"),
      noShow: count("no_show"),
      cancelled: count("cancelled"),
    },
  });
});

export const callNext = asyncHandler(async (req, res) => {
  const counter = await findOwnCounter(req, res);

  if (counter.status !== "active") {
    res.status(409);
    throw new Error(
      counter.status === "paused"
        ? "Resume your counter before calling the next token"
        : "This counter is inactive. Please contact the admin"
    );
  }

  await releaseStaleCounterToken(counter._id);

  const current = await Counter.findById(counter._id).select("currentToken");
  if (current?.currentToken) {
    res.status(409);
    throw new Error("Finish the current token before calling the next one");
  }

  const now = new Date();
  const token = await Token.findOneAndUpdate(
    { counter: counter._id, dateKey: getDateKey(), status: "waiting" },
    { $set: { status: "serving", calledAt: now, servingStartedAt: now } },
    { sort: { queuedAt: 1, tokenNumber: 1 }, new: true }
  );

  if (!token) {
    res.status(404);
    throw new Error("No tokens are waiting at your counter");
  }

  const claimed = await Counter.findOneAndUpdate(
    { _id: counter._id, currentToken: null },
    { $set: { currentToken: token._id } }
  );

  if (!claimed) {
    await Token.updateOne(
      { _id: token._id },
      { $set: { status: "waiting" }, $unset: { calledAt: "", servingStartedAt: "" } }
    );
    res.status(409);
    throw new Error("Finish the current token before calling the next one");
  }

  await recalculateCounterQueue(counter._id, token.dateKey);
  await token.populate(FARMER_POPULATE);

  res.json({ success: true, token: formatToken(token) });
});

export const updateTokenStatus = asyncHandler(async (req, res) => {
  const { status } = req.body;
  const counter = await findOwnCounter(req, res);

  const token = await Token.findById(req.params.id);
  if (!token) {
    res.status(404);
    throw new Error("Token not found");
  }

  if (String(token.counter) !== String(counter._id)) {
    res.status(403);
    throw new Error("This token does not belong to your counter");
  }

  if (token.status !== "serving") {
    res.status(400);
    throw new Error(`Only the token being served can be marked ${status.replace("_", " ")}`);
  }

  const update = {
    $set: { status, isActive: false, [CLOSED_AT_FIELD[status]]: new Date() },
  };
  if (status === "skipped") update.$inc = { skipCount: 1 };

  const updated = await Token.findOneAndUpdate(
    { _id: token._id, status: "serving" },
    update,
    { new: true }
  );

  if (!updated) {
    res.status(409);
    throw new Error("This token was already updated");
  }

  await Counter.updateOne(
    { _id: counter._id, currentToken: token._id },
    { $set: { currentToken: null } }
  );
  await recalculateCounterQueue(counter._id, token.dateKey);
  await updated.populate(FARMER_POPULATE);

  res.json({
    success: true,
    token: {
      ...formatToken(updated),
      canRejoin: status === "skipped" && Boolean(updated.farmer) && updated.skipCount < MAX_SKIPS,
    },
  });
});

export const registerWalkIn = asyncHandler(async (req, res) => {
  const ownCounter = await findOwnCounter(req, res);

  const service = await Service.findById(req.body.service || ownCounter.service);
  if (!service || !service.isActive || String(service.center) !== String(ownCounter.center)) {
    res.status(400);
    throw new Error("This service is not available at your center");
  }

  const useOwnCounter =
    String(service._id) === String(ownCounter.service) && ownCounter.status === "active";
  const counter = useOwnCounter ? ownCounter : await pickCounter(ownCounter.center, service._id);

  if (!counter) {
    res.status(409);
    throw new Error("No counter is running for this service right now");
  }

  const dateKey = getDateKey();
  const tokenNumber = await nextTokenNumber(ownCounter.center, dateKey);

  const token = await Token.create({
    tokenNumber,
    tokenCode: buildTokenCode(service.name, tokenNumber),
    dateKey,
    center: ownCounter.center,
    service: service._id,
    counter: counter._id,
    walkInName: req.body.walkInName,
    walkInPhone: req.body.walkInPhone || undefined,
    notes: req.body.notes || undefined,
    source: "walk_in",
    createdBy: req.user._id,
  });

  const queue = await getTokenQueueInfo(token);
  token.estimatedWaitMinutes = queue.estimatedWaitMinutes;
  await token.save();

  res.status(201).json({
    success: true,
    token: { ...formatToken(token), counterName: counter.name, queue },
  });
});