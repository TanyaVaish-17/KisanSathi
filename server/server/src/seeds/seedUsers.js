import "dotenv/config";
import mongoose from "mongoose";
import { connectDB } from "../config/db.js";
import User from "../models/User.js";

const users = [
  { name: "KisanSathi Admin", email: "admin@kisansathi.in", password: "admin123", role: "admin" },
  { name: "Mandi Operator", email: "operator@kisansathi.in", password: "operator123", role: "operator" },
  { name: "Operator Two", email: "operator2@kisansathi.in", password: "operator123", role: "operator" },
  { name: "Operator Three", email: "operator3@kisansathi.in", password: "operator123", role: "operator" },
];

const seed = async () => {
  await connectDB();

  for (const data of users) {
    const exists = await User.findOne({ email: data.email });
    if (exists) {
      console.log(`Skipped (already exists): ${data.email}`);
      continue;
    }
    await User.create(data);
    console.log(`Created ${data.role}: ${data.email}`);
  }

  await mongoose.disconnect();
};

seed().catch((err) => {
  console.error("Seeding failed:", err.message);
  process.exit(1);
});