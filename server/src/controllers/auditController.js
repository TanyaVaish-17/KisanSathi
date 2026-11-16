import AuditLog from "../models/AuditLog.js";
import asyncHandler from "../utils/asyncHandler.js";

const dayStart = (date) => new Date(`${date}T00:00:00.000+05:30`);
const dayEnd = (date) => new Date(`${date}T23:59:59.999+05:30`);

export const getAuditLogs = asyncHandler(async (req, res) => {
  const page = Math.max(Number(req.query.page) || 1, 1);
  const limit = Math.min(Math.max(Number(req.query.limit) || 50, 1), 200);

  const filter = {};
  if (req.query.category) filter.category = req.query.category;
  if (req.query.action) filter.action = req.query.action;
  if (req.query.center) filter.center = req.query.center;
  if (req.query.actor) filter.actor = req.query.actor;

  if (req.query.from || req.query.to) {
    filter.createdAt = {};
    if (req.query.from) filter.createdAt.$gte = dayStart(req.query.from);
    if (req.query.to) filter.createdAt.$lte = dayEnd(req.query.to);
  }

  const [logs, total] = await Promise.all([
    AuditLog.find(filter)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .populate("actor", "name role")
      .populate("center", "name"),
    AuditLog.countDocuments(filter),
  ]);

  res.json({ success: true, page, limit, total, pages: Math.ceil(total / limit), logs });
});