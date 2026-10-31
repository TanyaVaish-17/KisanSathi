import Service from "../models/Service.js";
import ServiceCenter from "../models/ServiceCenter.js";
import Counter from "../models/Counter.js";
import asyncHandler from "../utils/asyncHandler.js";
import pick from "../utils/pick.js";

const UPDATE_FIELDS = ["name", "nameHi", "description", "estimatedDuration", "isActive"];

// Public: list active services
export const getServices = asyncHandler(async (req, res) => {
  const filter = { isActive: true };
  if (req.query.center) filter.center = req.query.center;

  const services = await Service.find(filter).populate("center", "name district").sort("name");
  res.json({ success: true, count: services.length, services });
});

// Admin: list all services
export const getAllServices = asyncHandler(async (req, res) => {
  const filter = {};
  if (req.query.center) filter.center = req.query.center;

  const services = await Service.find(filter).populate("center", "name district").sort("-createdAt");
  res.json({ success: true, count: services.length, services });
});

// Admin: create service
export const createService = asyncHandler(async (req, res) => {
  const center = await ServiceCenter.findById(req.body.center);
  if (!center) {
    res.status(404);
    throw new Error("Center not found");
  }

  const service = await Service.create({
    center: center._id,
    ...pick(req.body, UPDATE_FIELDS),
  });

  res.status(201).json({ success: true, service });
});

// Admin: update service
export const updateService = asyncHandler(async (req, res) => {
  const service = await Service.findById(req.params.id);
  if (!service) {
    res.status(404);
    throw new Error("Service not found");
  }

  Object.assign(service, pick(req.body, UPDATE_FIELDS));
  await service.save();

  res.json({ success: true, service });
});

// Admin: delete service
export const deleteService = asyncHandler(async (req, res) => {
  const service = await Service.findById(req.params.id);
  if (!service) {
    res.status(404);
    throw new Error("Service not found");
  }

  const counterCount = await Counter.countDocuments({ service: service._id });
  if (counterCount > 0) {
    res.status(400);
    throw new Error("Remove the counters using this service first, or mark it inactive");
  }

  await service.deleteOne();
  res.json({ success: true, message: "Service deleted" });
});