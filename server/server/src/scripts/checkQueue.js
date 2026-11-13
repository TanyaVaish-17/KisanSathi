import "dotenv/config";
import mongoose from "mongoose";
import { connectDB } from "../config/db.js";
import ServiceCenter from "../models/ServiceCenter.js";
import Counter from "../models/Counter.js";
import Token from "../models/Token.js";
import { getDateKey } from "../utils/dateKey.js";
import { calculateQueueState, pickCounter, suggestArrival } from "../services/queueService.js";

const show = (state) =>
  console.table(
    state.entries.map((e) => ({
      token: e.token.tokenCode,
      position: e.position,
      ahead: e.aheadCount,
      waitMinutes: e.estimatedWaitMinutes,
    }))
  );

const run = async () => {
  await connectDB();

  const center = await ServiceCenter.findOne({ name: "Dasna Krishi Mandi" });
  const counter = await Counter.findOne({ center: center._id, name: "Counter 1" });
  const dateKey = getDateKey();

  const tokens = [];
  try {
    for (let i = 1; i <= 3; i++) {
      tokens.push(
        await Token.create({
          tokenNumber: 9000 + i,
          tokenCode: `TEST-${i}`,
          dateKey,
          center: center._id,
          service: counter.service,
          counter: counter._id,
          walkInName: `Test Farmer ${i}`,
          source: "walk_in",
          queuedAt: new Date(Date.now() + i * 1000),
        })
      );
    }

    let state = await calculateQueueState(counter._id, dateKey);
    console.log(`Service duration: ${state.duration} min. Three tokens waiting, nobody serving:`);
    show(state);

    tokens[0].status = "serving";
    tokens[0].servingStartedAt = new Date();
    await tokens[0].save();

    state = await calculateQueueState(counter._id, dateKey);
    console.log("After TEST-1 starts being served:");
    show(state);

    const picked = await pickCounter(center._id, counter.service, dateKey);
    console.log("Counter picked for a new token:", picked.name);

    console.log("Arrival advice for a 40 minute wait:", suggestArrival(40).message);
    console.log("Arrival advice for a 10 minute wait:", suggestArrival(10).message);
  } finally {
    await Token.deleteMany({ tokenCode: /^TEST-/ });
    await mongoose.disconnect();
    console.log("Test tokens removed");
  }
};

run().catch((err) => {
  console.error("Check failed:", err.message);
  process.exit(1);
});