import ServiceCenter from "../models/ServiceCenter.js";
import Service from "../models/Service.js";
import Counter from "../models/Counter.js";
import asyncHandler from "../utils/asyncHandler.js";
import pick from "../utils/pick.js";

const CENTER_FIELDS = [
  "name",
  "type",
  "address",
  "district",
  "state",
  "latitude",
  "longitude",
  "openTime",
  "closeTime",
  "workingDays",
  "status",
];

const escapeRegex = (text) => text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

// Public: list active centers
export const getCenters = asyncHandler(async (req, res) => {
  const { district, q } = req.query;
  const filter = { status: "active" };

  if (district) filter.district = new RegExp(`^${escapeRegex(district)}$`, "i");
  if (q) filter.name = new RegExp(escapeRegex(q), "i");

  const centers = await ServiceCenter.find(filter).sort("name");
  res.json({ success: true, count: centers.length, centers });
});

// Public: single center with its services
export const getCenterById = asyncHandler(async (req, res) => {
  const center = await ServiceCenter.findById(req.params.id);

  if (!center || center.status !== "active") {
    res.status(404);
    throw new Error("Center not found");
  }

  const services = await Service.find({ center: center._id, isActive: true }).sort("name");
  res.json({ success: true, center, services });
});

// Admin: list all centers
export const getAllCenters = asyncHandler(async (req, res) => {
  const centers = await ServiceCenter.find().sort("-createdAt");
  res.json({ success: true, count: centers.length, centers });
});

// Admin: create center
export const createCenter = asyncHandler(async (req, res) => {
  const center = await ServiceCenter.create(pick(req.body, CENTER_FIELDS));
  res.status(201).json({ success: true, center });
});

// Admin: update center
export const updateCenter = asyncHandler(async (req, res) => {
  const center = await ServiceCenter.findById(req.params.id);

  if (!center) {
    res.status(404);
    throw new Error("Center not found");
  }

  Object.assign(center, pick(req.body, CENTER_FIELDS));
  await center.save();

  res.json({ success: true, center });
});

// Admin: delete center
export const deleteCenter = asyncHandler(async (req, res) => {
  const center = await ServiceCenter.findById(req.params.id);

  if (!center) {
    res.status(404);
    throw new Error("Center not found");
  }

  const [serviceCount, counterCount] = await Promise.all([
    Service.countDocuments({ center: center._id }),
    Counter.countDocuments({ center: center._id }),
  ]);

  if (serviceCount > 0 || counterCount > 0) {
    res.status(400);
    throw new Error("Remove this center's services and counters first, or mark it inactive");
  }

  await center.deleteOne();
  res.json({ success: true, message: "Center deleted" });
});