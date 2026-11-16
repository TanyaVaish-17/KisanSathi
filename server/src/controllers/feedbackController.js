import mongoose from "mongoose";
import Feedback from "../models/Feedback.js";
import Token from "../models/Token.js";
import asyncHandler from "../utils/asyncHandler.js";

const POPULATE = [
  { path: "center", select: "name district" },
  { path: "service", select: "name nameHi" },
  { path: "token", select: "tokenCode dateKey" },
];

export const createFeedback = asyncHandler(async (req, res) => {
  const token = await Token.findOne({ _id: req.body.token, farmer: req.user._id });

  if (!token) {
    res.status(404);
    throw new Error("Token not found");
  }

  if (token.status !== "completed") {
    res.status(400);
    throw new Error("Feedback can only be given after your visit is completed");
  }

  let feedback;
  try {
    feedback = await Feedback.create({
      farmer: req.user._id,
      token: token._id,
      center: token.center,
      service: token.service,
      rating: req.body.rating,
      comment: req.body.comment || undefined,
    });
  } catch (error) {
    if (error.code === 11000) {
      res.status(409);
      throw new Error("You have already given feedback for this visit");
    }
    throw error;
  }

  await feedback.populate(POPULATE);
  res.status(201).json({ success: true, feedback });
});

export const getMyFeedback = asyncHandler(async (req, res) => {
  const feedback = await Feedback.find({ farmer: req.user._id })
    .sort({ createdAt: -1 })
    .limit(100)
    .populate(POPULATE);

  res.json({ success: true, count: feedback.length, feedback });
});

export const getAllFeedback = asyncHandler(async (req, res) => {
  const limit = Math.min(Math.max(Number(req.query.limit) || 50, 1), 200);
  const filter = {};

  if (req.query.center) filter.center = new mongoose.Types.ObjectId(req.query.center);
  if (req.query.rating) filter.rating = Number(req.query.rating);

  const summaryMatch = { ...filter };
  delete summaryMatch.rating;

  const [feedback, totals, byRating] = await Promise.all([
    Feedback.find(filter)
      .sort({ createdAt: -1 })
      .limit(limit)
      .populate(POPULATE)
      .populate("farmer", "name village"),
    Feedback.aggregate([
      { $match: summaryMatch },
      { $group: { _id: null, count: { $sum: 1 }, average: { $avg: "$rating" } } },
    ]),
    Feedback.aggregate([
      { $match: summaryMatch },
      { $group: { _id: "$rating", count: { $sum: 1 } } },
    ]),
  ]);

  const distribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
  byRating.forEach((row) => {
    distribution[row._id] = row.count;
  });

  res.json({
    success: true,
    summary: {
      count: totals[0]?.count || 0,
      average: totals[0] ? Number(totals[0].average.toFixed(2)) : 0,
      distribution,
    },
    feedback,
  });
});