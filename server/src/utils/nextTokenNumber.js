import Token from "../models/Token.js";
import TokenSequence from "../models/TokenSequence.js";

export const getNextTokenNumber = async (center, dateKey) => {
  const filter = { center, dateKey };
  const existingSequence = await TokenSequence.findOneAndUpdate(
    filter,
    { $inc: { seq: 1 } },
    { new: true }
  );
  if (existingSequence) return existingSequence.seq;

  const lastToken = await Token.findOne({ center, dateKey })
    .sort({ tokenNumber: -1 })
    .select("tokenNumber")
    .lean();
  try {
    await TokenSequence.create({
      ...filter,
      seq: lastToken?.tokenNumber || 0,
    });
  } catch (error) {
    if (error.code !== 11000) throw error;
  }

  const sequence = await TokenSequence.findOneAndUpdate(
    filter,
    { $inc: { seq: 1 } },
    { new: true }
  );
  if (!sequence) throw new Error("Unable to allocate the next token number");
  return sequence.seq;
};
