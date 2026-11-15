import TokenSequence from "../models/TokenSequence.js";

export const serviceInitials = (name) =>
  name
    .split(/\s+/)
    .filter(Boolean)
    .map((word) => word[0].toUpperCase())
    .join("")
    .slice(0, 3);

export const nextTokenNumber = async (centerId, dateKey) => {
  const sequence = await TokenSequence.findOneAndUpdate(
    { center: centerId, dateKey },
    { $inc: { seq: 1 } },
    { upsert: true, new: true }
  );
  return sequence.seq;
};

export const buildTokenCode = (serviceName, tokenNumber) =>
  `${serviceInitials(serviceName)}-${String(tokenNumber).padStart(3, "0")}`;