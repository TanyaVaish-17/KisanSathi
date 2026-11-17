import asyncHandler from "../utils/asyncHandler.js";
import { getDateKey } from "../utils/dateKey.js";
import { buildAnalytics, daysBetween, shiftDateKey } from "../services/analyticsService.js";

const MAX_DAYS = 92;

export const getAnalytics = asyncHandler(async (req, res) => {
  const to = req.query.to || getDateKey();
  const from = req.query.from || shiftDateKey(to, -6);

  if (shiftDateKey(from, 0) !== from || shiftDateKey(to, 0) !== to) {
    res.status(400);
    throw new Error("Invalid date");
  }

  if (from > to) {
    res.status(400);
    throw new Error("From date must be on or before the To date");
  }

  if (daysBetween(from, to) > MAX_DAYS) {
    res.status(400);
    throw new Error(`Date range cannot exceed ${MAX_DAYS} days`);
  }

  const data = await buildAnalytics({ from, to, center: req.query.center });
  res.json({ success: true, ...data });
});