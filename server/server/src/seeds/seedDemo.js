import "dotenv/config";
import mongoose from "mongoose";
import { connectDB } from "../config/db.js";
import User from "../models/User.js";
import ServiceCenter from "../models/ServiceCenter.js";
import Service from "../models/Service.js";
import Counter from "../models/Counter.js";

const extraOperators = [4, 5, 6].map((n) => ({
  name: `Operator ${n}`,
  email: `operator${n}@kisansathi.in`,
  password: "operator123",
  role: "operator",
}));

const demo = [
  {
    center: {
      name: "Dasna Krishi Mandi",
      type: "mandi",
      address: "Main Market Road, Dasna",
      district: "Ghaziabad",
    },
    services: [
      { name: "Crop Weighing", nameHi: "फसल तौल", description: "Weighing of produce at the mandi", estimatedDuration: 10 },
      { name: "Payment Settlement", nameHi: "भुगतान निपटान", description: "Settlement of payment for sold produce", estimatedDuration: 15 },
    ],
    counters: [
      { name: "Counter 1", service: "Crop Weighing" },
      { name: "Counter 2", service: "Payment Settlement" },
    ],
  },
  {
    center: {
      name: "Hapur Anaj Mandi",
      type: "mandi",
      address: "Garh Road, Hapur",
      district: "Hapur",
    },
    services: [
      { name: "Crop Weighing", nameHi: "फसल तौल", description: "Weighing of produce at the mandi", estimatedDuration: 10 },
      { name: "Procurement Registration", nameHi: "खरीद पंजीकरण", description: "Registration for government procurement", estimatedDuration: 8 },
    ],
    counters: [
      { name: "Counter 1", service: "Crop Weighing" },
      { name: "Counter 2", service: "Procurement Registration" },
    ],
  },
  {
    center: {
      name: "Meerut Procurement Center",
      type: "procurement_center",
      address: "Delhi Road, Meerut",
      district: "Meerut",
      openTime: "08:00",
      closeTime: "16:00",
    },
    services: [
      { name: "Procurement Registration", nameHi: "खरीद पंजीकरण", description: "Registration for government procurement", estimatedDuration: 8 },
      { name: "Quality Check", nameHi: "गुणवत्ता जांच", description: "Moisture and quality inspection of produce", estimatedDuration: 12 },
    ],
    counters: [
      { name: "Counter 1", service: "Procurement Registration" },
      { name: "Counter 2", service: "Quality Check" },
    ],
  },
];

const nextFreeOperator = async () => {
  const assigned = (await Counter.distinct("operator")).filter(Boolean).map(String);
  const operators = await User.find({ role: "operator", isActive: true }).sort("createdAt");
  return operators.find((o) => !assigned.includes(String(o._id))) || null;
};

const seed = async () => {
  await connectDB();

  // Operators
  for (const data of extraOperators) {
    const exists = await User.findOne({ email: data.email });
    if (exists) continue;
    await User.create(data);
    console.log(`Created operator: ${data.email}`);
  }

  // Centers, services and counters
  for (const entry of demo) {
    const { name, district } = entry.center;

    let center = await ServiceCenter.findOne({ name, district });
    if (center) {
      console.log(`Center exists: ${name}`);
    } else {
      center = await ServiceCenter.create(entry.center);
      console.log(`Created center: ${name}`);
    }

    const serviceMap = {};
    for (const data of entry.services) {
      let service = await Service.findOne({ center: center._id, name: data.name });
      if (!service) {
        service = await Service.create({ ...data, center: center._id });
        console.log(`  Created service: ${data.name}`);
      }
      serviceMap[data.name] = service;
    }

    for (const data of entry.counters) {
      const exists = await Counter.findOne({ center: center._id, name: data.name });
      if (exists) continue;

      const operator = await nextFreeOperator();
      await Counter.create({
        center: center._id,
        name: data.name,
        service: serviceMap[data.service]._id,
        operator: operator ? operator._id : null,
      });
      console.log(`  Created ${data.name} (${data.service}), operator: ${operator ? operator.email : "none"}`);
    }
  }

  await mongoose.disconnect();
  console.log("Demo seeding finished");
};

seed().catch((err) => {
  console.error("Seeding failed:", err.message);
  process.exit(1);
});