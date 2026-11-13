import Counter from "../models/Counter.js";
import Service from "../models/Service.js";
import ServiceCenter from "../models/ServiceCenter.js";
import User from "../models/User.js";
import asyncHandler from "../utils/asyncHandler.js";
import pick from "../utils/pick.js";

const FIELDS = ["name", "service", "operator"];

const POPULATE = [
  { path: "center", select: "name district" },
  { path: "service", select: "name estimatedDuration" },
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

  const assigned = await Counter.find({ operator: { $in: operators.map((o) => o._id) } }).select(
    "name operator"
  );

  const assignedMap = new Map(assigned.map((c) => [String(c.operator), { id: c._id, name: c.name }]));

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
  await counter.populate(POPULATE);

  res.json({ success: true, counter });
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