import Token from "../models/Token.js";
import ServiceCenter from "../models/ServiceCenter.js";
import Service from "../models/Service.js";
import Counter from "../models/Counter.js";
import asyncHandler from "../utils/asyncHandler.js";
import { nextTokenNumber, buildTokenCode } from "../services/tokenService.js";
import { getDateKey, getIstClock } from "../utils/dateKey.js";
import {
  expireStaleTokens,
  getTokenQueueInfo,
  pickCounter,
  recalculateCounterQueue,
  suggestArrival,
  MAX_SKIPS,
} from "../services/queueService.js";

const POPULATE = [
  { path: "center", select: "name district address" },
  { path: "service", select: "name nameHi estimatedDuration" },
  { path: "counter", select: "name status" },
];

const toMinutes = (time) => {
  const [h, m] = time.split(":").map(Number);
  return h * 60 + m;
};

const describeToken = async (token) => {
  const queue = await getTokenQueueInfo({
    _id: token._id,
    counter: token.counter?._id || token.counter,
    status: token.status,
    dateKey: token.dateKey,
  });

  return {
    ...token.toObject(),
    queue,
    arrival: queue.position ? suggestArrival(queue.estimatedWaitMinutes) : null,
  };
};

export const createToken = asyncHandler(async (req, res) => {
  const center = await ServiceCenter.findById(req.body.center);
  if (!center || center.status !== "active") {
    res.status(404);
    throw new Error("Center not found");
  }

  const service = await Service.findById(req.body.service);
  if (!service || !service.isActive || String(service.center) !== String(center._id)) {
    res.status(400);
    throw new Error("This service is not available at the selected center");
  }

  if (process.env.ENFORCE_CENTER_HOURS === "true") {
    const clock = getIstClock();
    if (!center.workingDays.includes(clock.day)) {
      res.status(400);
      throw new Error("This center is closed today");
    }
    if (clock.minutes >= toMinutes(center.closeTime)) {
      res.status(400);
      throw new Error("This center has closed for today");
    }
  }

  await expireStaleTokens({ farmerId: req.user._id });

  const existing = await Token.findOne({ farmer: req.user._id, isActive: true });
  if (existing) {
    res.status(409);
    throw new Error(`You already have an active token (${existing.tokenCode}). Cancel it before booking another`);
  }

  const counter = await pickCounter(center._id, service._id);
  if (!counter) {
    res.status(409);
    throw new Error("No counter is running for this service right now");
  }

  const dateKey = getDateKey();
  const tokenNumber = await nextTokenNumber(center._id, dateKey);

  let token;
  try {
    token = await Token.create({
      tokenNumber,
      tokenCode: buildTokenCode(service.name, tokenNumber),
      dateKey,
      center: center._id,
      service: service._id,
      counter: counter._id,
      farmer: req.user._id,
      createdBy: req.user._id,
      source: "online",
    });
  } catch (err) {
    if (err.code === 11000 && err.keyPattern?.farmer) {
      res.status(409);
      throw new Error("You already have an active token. Cancel it before booking another");
    }
    throw err;
  }

  const info = await getTokenQueueInfo(token);
  token.estimatedWaitMinutes = info.estimatedWaitMinutes;
  await token.save();
  await token.populate(POPULATE);

  res.status(201).json({ success: true, token: await describeToken(token) });
});

export const getMyTokens = asyncHandler(async (req, res) => {
  await expireStaleTokens({ farmerId: req.user._id });

  const active = await Token.findOne({ farmer: req.user._id, isActive: true }).populate(POPULATE);
  const history = await Token.find({ farmer: req.user._id, isActive: false })
    .sort("-createdAt")
    .limit(50)
    .populate(POPULATE);

  const today = getDateKey();

  res.json({
    success: true,
    active: active ? await describeToken(active) : null,
    history: history.map((token) => ({
      ...token.toObject(),
      canRejoin:
        token.status === "skipped" && token.dateKey === today && token.skipCount < MAX_SKIPS,
    })),
  });
});

export const getTokenById = asyncHandler(async (req, res) => {
  const token = await Token.findById(req.params.id).populate(POPULATE);
  if (!token) {
    res.status(404);
    throw new Error("Token not found");
  }

  if (req.user.role === "farmer" && String(token.farmer) !== String(req.user._id)) {
    res.status(403);
    throw new Error("You can only view your own tokens");
  }

  if (req.user.role === "operator") {
    const ownsCounter = token.counter
      ? await Counter.exists({ _id: token.counter._id, operator: req.user._id })
      : null;
    if (!ownsCounter) {
      res.status(403);
      throw new Error("This token does not belong to your counter");
    }
  }

  res.json({ success: true, token: await describeToken(token) });
});

export const cancelToken = asyncHandler(async (req, res) => {
  const token = await Token.findById(req.params.id);
  if (!token || String(token.farmer) !== String(req.user._id)) {
    res.status(404);
    throw new Error("Token not found");
  }

  if (token.status === "serving") {
    res.status(400);
    throw new Error("A token that is being served cannot be cancelled");
  }

  if (token.status !== "waiting") {
    res.status(400);
    throw new Error(`This token is already ${token.status.replace("_", " ")}`);
  }

  token.status = "cancelled";
  token.cancelledAt = new Date();
  token.cancelReason = req.body.reason || undefined;
  await token.save();

  if (token.counter) await recalculateCounterQueue(token.counter, token.dateKey);

  await token.populate(POPULATE);
  res.json({ success: true, token: await describeToken(token) });
});

export const rejoinToken = asyncHandler(async (req, res) => {
  const token = await Token.findById(req.params.id);
  if (!token || String(token.farmer) !== String(req.user._id)) {
    res.status(404);
    throw new Error("Token not found");
  }

  if (token.status !== "skipped") {
    res.status(400);
    throw new Error("Only a skipped token can rejoin the queue");
  }

  if (token.dateKey !== getDateKey()) {
    res.status(400);
    throw new Error("This token is from an earlier day. Please book a new token");
  }

  if (token.skipCount >= MAX_SKIPS) {
    res.status(400);
    throw new Error("This token was skipped too many times to rejoin. Please book a new token");
  }

  const existing = await Token.findOne({ farmer: req.user._id, isActive: true });
  if (existing) {
    res.status(409);
    throw new Error(`You already have an active token (${existing.tokenCode})`);
  }

  const counter = await pickCounter(token.center, token.service, token.dateKey);
  if (!counter) {
    res.status(409);
    throw new Error("No counter is running for this service right now");
  }

  let rejoined;
  try {
    rejoined = await Token.findOneAndUpdate(
      { _id: token._id, status: "skipped", dateKey: getDateKey(), skipCount: { $lt: MAX_SKIPS } },
      {
        $set: { status: "waiting", isActive: true, counter: counter._id, queuedAt: new Date() },
        $unset: { skippedAt: "" },
      },
      { new: true }
    );
  } catch (err) {
    if (err.code === 11000 && err.keyPattern?.farmer) {
      res.status(409);
      throw new Error("You already have an active token");
    }
    throw err;
  }

  if (!rejoined) {
    res.status(409);
    throw new Error("This token can no longer rejoin the queue");
  }

  const info = await getTokenQueueInfo(rejoined);
  rejoined.estimatedWaitMinutes = info.estimatedWaitMinutes;
  await rejoined.save();
  await rejoined.populate(POPULATE);

  res.json({ success: true, token: await describeToken(rejoined) });
});