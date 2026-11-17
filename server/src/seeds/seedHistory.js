import "dotenv/config";
import mongoose from "mongoose";
import { connectDB } from "../config/db.js";
import Counter from "../models/Counter.js";
import Token from "../models/Token.js";
import User from "../models/User.js";
import { getDateKey } from "../utils/dateKey.js";
import { shiftDateKey } from "../services/analyticsService.js";
import { buildHistory } from "./historyData.js";

const DAYS = 6;
const clearOnly = process.argv.includes("--clear");

const toMinutes = (time) => {
  const [hours, minutes] = time.split(":").map(Number);
  return hours * 60 + minutes;
};

const run = async () => {
  await connectDB();

  const removed = await Token.deleteMany({ notes: "demo-history" });
  console.log(`Removed ${removed.deletedCount} earlier demo history tokens`);

  if (!clearOnly) {
    const today = getDateKey();
    const dateKeys = Array.from({ length: DAYS }, (_, index) =>
      shiftDateKey(today, index - DAYS)
    );

    const counters = await Counter.find({ status: { $ne: "inactive" } })
      .populate("center", "openTime closeTime")
      .populate("service", "estimatedDuration");
    const farmers = await User.find({ role: "farmer", isActive: true }).select("_id");

    const docs = buildHistory({
      counters: counters.map((counter) => ({
        _id: counter._id,
        center: counter.center._id,
        service: counter.service._id,
        openMin: toMinutes(counter.center.openTime),
        closeMin: toMinutes(counter.center.closeTime),
        duration: counter.service.estimatedDuration,
      })),
      farmers: farmers.map((farmer) => farmer._id),
      dateKeys,
    });

    if (docs.length > 0) await Token.collection.insertMany(docs);
    console.log(`Created ${docs.length} demo history tokens from ${dateKeys[0]} to ${dateKeys.at(-1)}`);
  }

  await mongoose.disconnect();
};

run().catch((error) => {
  console.error("History seeding failed:", error.message);
  process.exit(1);
});