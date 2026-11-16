import "dotenv/config";
import mongoose from "mongoose";
import { connectDB } from "../config/db.js";
import Counter from "../models/Counter.js";
import Service from "../models/Service.js";
import Token, { ACTIVE_STATUSES } from "../models/Token.js";
import User from "../models/User.js";
import { recalculateCounterQueue } from "../services/queueService.js";
import { getDateKey } from "../utils/dateKey.js";
import { getNextTokenNumber } from "../utils/nextTokenNumber.js";

const FARMERS_PER_COUNTER = 5;
const FARMER_PASSWORD = "farmer123";

const seed = async () => {
  await connectDB();

  const dateKey = getDateKey();
  const counters = await Counter.find({ status: { $ne: "inactive" } })
    .populate("service", "name estimatedDuration averageDuration isActive")
    .sort("center name");
  let createdTokens = 0;
  let skippedFarmers = 0;

  for (const [counterIndex, counter] of counters.entries()) {
    const service = counter.service;
    if (!service || !service.isActive) {
      console.warn(`Skipped ${counter.name}: its service is missing or inactive`);
      continue;
    }

    let counterCreated = 0;
    for (let farmerIndex = 1; farmerIndex <= FARMERS_PER_COUNTER; farmerIndex += 1) {
      const farmerNumber = counterIndex * FARMERS_PER_COUNTER + farmerIndex;
      const email = `farmer${farmerNumber}@kisansathi.in`;
      let farmer = await User.findOne({ email });

      if (!farmer) {
        farmer = await User.create({
          name: `Queue Farmer ${farmerNumber}`,
          email,
          password: FARMER_PASSWORD,
          role: "farmer",
        });
        console.log(`Created farmer account: ${email}`);
      } else if (farmer.role !== "farmer") {
        throw new Error(`Seed account ${email} already exists with role ${farmer.role}`);
      }

      const activeToken = await Token.findOne({
        farmer: farmer._id,
        status: { $in: ACTIVE_STATUSES },
      });

      if (activeToken) {
        if (
          String(activeToken.counter) === String(counter._id) &&
          activeToken.dateKey === dateKey
        ) {
          continue;
        }

        console.warn(`Skipped ${email}: farmer already has an active token`);
        skippedFarmers += 1;
        continue;
      }

      const tokenNumber = await getNextTokenNumber(counter.center, dateKey);
      await Token.create({
        tokenNumber,
        tokenCode: String(tokenNumber).padStart(3, "0"),
        dateKey,
        center: counter.center,
        service: service._id,
        counter: counter._id,
        farmer: farmer._id,
        source: "online",
        estimatedServiceMinutes: service.averageDuration || service.estimatedDuration,
      });

      counterCreated += 1;
      createdTokens += 1;
    }

    await recalculateCounterQueue(counter._id, dateKey);
    console.log(`${counter.name} (${service.name}): added ${counterCreated} farmer token(s)`);
  }

  console.log(
    `Farmer seeding finished: ${createdTokens} token(s) created, ${skippedFarmers} farmer(s) skipped.`
  );
  console.log(`Seed farmer login password: ${FARMER_PASSWORD}`);
};

seed()
  .catch((error) => {
    console.error("Farmer seeding failed:", error.message);
    process.exitCode = 1;
  })
  .finally(async () => {
    await mongoose.disconnect();
  });
