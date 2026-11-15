import Counter from "../models/Counter.js";
import Service from "../models/Service.js";
import ServiceCenter from "../models/ServiceCenter.js";
import Token from "../models/Token.js";
import User from "../models/User.js";
import asyncHandler from "../utils/asyncHandler.js";
import pick from "../utils/pick.js";
import { getCounterQueue, recalculateCounterQueue } from "../services/queueService.js";
import { getDateKey } from "../utils/dateKey.js";
import { getNextTokenNumber } from "../utils/nextTokenNumber.js";

const FIELDS = ["name", "service", "operator"];

const POPULATE = [
  { path: "center", select: "name district" },
  { path: "service", select: "name estimatedDuration averageDuration completedServiceCount" },
  { path: "operator", select: "name email phone" },
];

// Helpers
const checkService = async (serviceId, centerId, res) => {
  const service = await Service.findById(serviceId);
  if (!service || String(service.center) !== String(centerId)) {
    res.status(400);
    throw new Error("Service not found for this center");
  }
};

const checkOperator = async (operatorId, counterId, res) => {
  const operator = await User.findById(operatorId);
  if (!operator || operator.role !== "operator" || !operator.isActive) {
    res.status(400);
    throw new Error("Selected user is not an active operator");
  }

  const query = { operator: operatorId };
  if (counterId) query._id = { $ne: counterId };

  const taken = await Counter.findOne(query);
  if (taken) {
    res.status(409);
    throw new Error(`Operator is already assigned to ${taken.name}`);
  }
};

// Public: active and paused counters
export const getCounters = asyncHandler(async (req, res) => {
  const filter = { status: { $ne: "inactive" } };
  if (req.query.center) filter.center = req.query.center;

  const counters = await Counter.find(filter)
    .select("center name service status")
    .populate("service", "name estimatedDuration")
    .sort("name");

  res.json({ success: true, count: counters.length, counters });
});

// Admin: all counters
export const getAllCounters = asyncHandler(async (req, res) => {
  const filter = {};
  if (req.query.center) filter.center = req.query.center;

  const counters = await Counter.find(filter).populate(POPULATE).sort("center name");
  res.json({ success: true, count: counters.length, counters });
});

// Admin: operators with their assigned counter
export const getOperators = asyncHandler(async (req, res) => {
  const operators = await User.find({ role: "operator", isActive: true })
    .select("name email phone")
    .sort("name");

  const assigned = await Counter.find({ operator: { $in: operators.map((o) => o._id) } })
    .select("name operator center")
    .populate("center", "name");

  const assignedMap = new Map(
    assigned.map((c) => [
      String(c.operator),
      { id: c._id, name: c.name, center: c.center },
    ])
  );

  res.json({
    success: true,
    operators: operators.map((o) => ({
      id: o._id,
      name: o.name,
      email: o.email,
      phone: o.phone,
      assignedCounter: assignedMap.get(String(o._id)) || null,
    })),
  });
});

// Operator: own counter
export const getMyCounter = asyncHandler(async (req, res) => {
  const counter = await Counter.findOne({ operator: req.user._id }).populate(POPULATE);
  res.json({ success: true, counter });
});

const getOperatorCounter = async (operatorId) =>
  Counter.findOne({ operator: operatorId }).populate(POPULATE);

const populateQueueToken = (token) =>
  token.populate({ path: "farmer", select: "name phone" });

const requireActiveCounter = async (req, res) => {
  const counter = await Counter.findOne({ operator: req.user._id });
  if (!counter) {
    res.status(404);
    throw new Error("No counter is assigned to this operator");
  }
  if (counter.status !== "active") {
    res.status(400);
    throw new Error("Counter must be active to manage the queue");
  }
  return counter;
};

// Operator: current serving token and waiting queue
export const getMyQueue = asyncHandler(async (req, res) => {
  const counter = await getOperatorCounter(req.user._id);
  if (!counter) {
    return res.json({ success: true, counter: null, serving: null, waiting: [] });
  }

  const { serving, waiting } = await getCounterQueue(counter._id);
  await Promise.all([serving, ...waiting].filter(Boolean).map(populateQueueToken));
  res.json({ success: true, counter, serving, waiting });
});

// Operator: move the next waiting token to serving
export const callNextToken = asyncHandler(async (req, res) => {
  const counter = await requireActiveCounter(req, res);
  const dateKey = getDateKey();
  const existingServing = await Token.exists({
    counter: counter._id,
    dateKey,
    status: "serving",
  });
  if (existingServing) {
    res.status(409);
    throw new Error("Complete or skip the current token before calling the next one");
  }

  const serving = await Token.findOneAndUpdate(
    { counter: counter._id, dateKey, status: "waiting" },
    { $set: { status: "serving", calledAt: new Date(), servingStartedAt: new Date() } },
    { new: true, sort: { queuedAt: 1, tokenNumber: 1 } }
  );
  if (serving) {
    counter.currentToken = serving._id;
    await counter.save();
    await populateQueueToken(serving);
  }
  await recalculateCounterQueue(counter._id, dateKey);
  res.json({ success: true, serving });
});

const finishServingToken = async (req, res, status) => {
  const counter = await requireActiveCounter(req, res);
  const token = await Token.findOne({
    counter: counter._id,
    dateKey: getDateKey(),
    status: "serving",
  });
  if (!token) {
    res.status(404);
    throw new Error("There is no token currently being served");
  }

  if (status === "completed") {
    const completedAt = new Date();
    const startedAt = token.servingStartedAt || token.calledAt;
    const actualMinutes = startedAt
      ? (completedAt.getTime() - new Date(startedAt).getTime()) / 60000
      : null;
    token.status = "completed";
    token.completedAt = completedAt;
    if (actualMinutes !== null && actualMinutes > 0 && actualMinutes <= 240) {
      token.actualServiceMinutes = Math.max(0.01, Number(actualMinutes.toFixed(2)));
    }
  } else {
    const { waiting } = await getCounterQueue(counter._id, token.dateKey);
    const lastQueuedAt = waiting.at(-1)?.queuedAt?.getTime() ?? 0;
    token.status = "waiting";
    token.queuedAt = new Date(Math.max(Date.now(), lastQueuedAt + 1));
    token.calledAt = undefined;
    token.servingStartedAt = undefined;
    token.skippedAt = new Date();
    token.skipCount += 1;
  }
  await token.save();

  if (status === "completed" && token.actualServiceMinutes !== null) {
    const service = await Service.findById(token.service);
    if (!service) {
      res.status(404);
      throw new Error("Service not found for completed token");
    }

    const previousAverage =
      service.averageDuration || token.estimatedServiceMinutes || service.estimatedDuration;
    const alpha = 0.3;
    service.averageDuration =
      service.completedServiceCount > 0
        ? Math.max(
            1,
            alpha * token.actualServiceMinutes + (1 - alpha) * previousAverage
          )
        : Math.max(1, token.actualServiceMinutes);
    service.completedServiceCount = (service.completedServiceCount || 0) + 1;
    service.durationStatsUpdatedAt = token.completedAt;
    await service.save();
  }

  counter.currentToken = null;
  await counter.save();
  await recalculateCounterQueue(counter._id, token.dateKey);
  await populateQueueToken(token);
  res.json({ success: true, token });
};

export const completeServingToken = asyncHandler((req, res) =>
  finishServingToken(req, res, "completed")
);

export const skipServingToken = asyncHandler((req, res) =>
  finishServingToken(req, res, "skipped")
);

// Operator: issue a ticket for a walk-in farmer
export const createWalkInToken = asyncHandler(async (req, res) => {
  const counter = await requireActiveCounter(req, res);
  const dateKey = getDateKey();
  const service = await Service.findById(counter.service);
  if (!service || !service.isActive) {
    res.status(400);
    throw new Error("The service for this counter is unavailable");
  }

  const tokenNumber = await getNextTokenNumber(counter.center, dateKey);
  const token = await Token.create({
    tokenNumber,
    tokenCode: String(tokenNumber).padStart(3, "0"),
    dateKey,
    center: counter.center,
    service: counter.service,
    counter: counter._id,
    walkInName: req.body.walkInName.trim(),
    walkInPhone: req.body.walkInPhone?.trim(),
    source: "walk_in",
    createdBy: req.user._id,
    estimatedServiceMinutes: service.averageDuration || service.estimatedDuration,
  });

  await recalculateCounterQueue(counter._id, dateKey);
  await populateQueueToken(token);
  res.status(201).json({ success: true, token });
});

// Admin: create counter
export const createCounter = asyncHandler(async (req, res) => {
  const center = await ServiceCenter.findById(req.body.center);
  if (!center) {
    res.status(404);
    throw new Error("Center not found");
  }

  const data = pick(req.body, FIELDS);
  await checkService(data.service, center._id, res);
  if (data.operator) await checkOperator(data.operator, null, res);

  const counter = await Counter.create({ ...data, center: center._id });
  await counter.populate(POPULATE);

  res.status(201).json({ success: true, counter });
});

// Admin: update counter
export const updateCounter = asyncHandler(async (req, res) => {
  const counter = await Counter.findById(req.params.id);
  if (!counter) {
    res.status(404);
    throw new Error("Counter not found");
  }

  const changes = pick(req.body, FIELDS);

  if (changes.service && String(changes.service) !== String(counter.service)) {
    if (counter.currentToken) {
      res.status(400);
      throw new Error("Cannot change the service while a token is being served");
    }
    await checkService(changes.service, counter.center, res);
  }

  if (changes.operator) await checkOperator(changes.operator, counter._id, res);

  Object.assign(counter, changes);
  await counter.save();
  await recalculateCounterQueue(counter._id);
  await counter.populate(POPULATE);

  res.json({ success: true, counter });
});

// Admin or operator: change status
export const updateCounterStatus = asyncHandler(async (req, res) => {
  const counter = await Counter.findById(req.params.id);
  if (!counter) {
    res.status(404);
    throw new Error("Counter not found");
  }

  const { status } = req.body;

  if (req.user.role === "operator") {
    if (String(counter.operator) !== String(req.user._id)) {
      res.status(403);
      throw new Error("You can only manage your own counter");
    }
    if (counter.status === "inactive") {
      res.status(403);
      throw new Error("This counter is inactive. Please contact the admin");
    }
    if (!["active", "paused"].includes(status)) {
      res.status(403);
      throw new Error("Operators can only pause or resume a counter");
    }
  }

  counter.status = status;
  await counter.save();
  await recalculateCounterQueue(counter._id);
  await counter.populate(POPULATE);

  res.json({ success: true, counter, ...(transfer && { transfer }) });
});

// Admin: delete counter
export const deleteCounter = asyncHandler(async (req, res) => {
  const counter = await Counter.findById(req.params.id);
  if (!counter) {
    res.status(404);
    throw new Error("Counter not found");
  }

  if (counter.currentToken) {
    res.status(400);
    throw new Error("Cannot delete a counter that is serving a token");
  }

  await counter.deleteOne();
  res.json({ success: true, message: "Counter deleted" });
});