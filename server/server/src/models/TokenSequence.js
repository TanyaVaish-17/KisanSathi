import mongoose from "mongoose";

const tokenSequenceSchema = new mongoose.Schema({
  center: { type: mongoose.Schema.Types.ObjectId, ref: "ServiceCenter", required: true },
  dateKey: { type: String, required: true },
  seq: { type: Number, default: 0 },
});

tokenSequenceSchema.index({ center: 1, dateKey: 1 }, { unique: true });

const TokenSequence = mongoose.model("TokenSequence", tokenSequenceSchema);
export default TokenSequence;