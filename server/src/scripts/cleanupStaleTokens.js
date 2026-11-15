import "dotenv/config";
import mongoose from "mongoose";
import { connectDB } from "../config/db.js";
import Token from "../models/Token.js";
import { getDateKey } from "../utils/dateKey.js";
import { expireStaleTokens } from "../services/queueService.js";

const apply = process.argv.includes("--apply");

const run = async () => {
  await connectDB();
  const dateKey = getDateKey();
  const activeToday = () =>
    Token.countDocuments({ dateKey, status: { $in: ["waiting", "serving"] } });

  const stale = await Token.find({
    status: { $in: ["waiting", "serving"] },
    dateKey: { $lt: dateKey },
  }).sort({ dateKey: 1, tokenNumber: 1 });

  console.log(`Today is ${dateKey}. Active tokens today: ${await activeToday()}. Stale tokens found: ${stale.length}`);
  console.table(
    stale.map((t) => ({
      id: String(t._id),
      code: t.tokenCode,
      date: t.dateKey,
      status: t.status,
    }))
  );

  if (apply) {
    const expired = await expireStaleTokens({ dateKey });
    console.log(`Expired ${expired} tokens. Active tokens today: ${await activeToday()}`);
  } else {
    console.log("Preview only. Nothing was changed.");
  }

  await mongoose.disconnect();
};

run().catch((err) => {
  console.error("Cleanup failed:", err.message);
  process.exit(1);
});