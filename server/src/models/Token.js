import mongoose from "mongoose";

export const TOKEN_STATUSES = ["waiting", "serving", "completed", "cancelled", "skipped", "no_show"];
export const ACTIVE_STATUSES = ["waiting", "serving"];

const tokenSchema = new mongoose.Schema(
  {
    tokenNumber: { type: Number, required: true, min: 1 },
    tokenCode: { type: String, required: true, trim: true },
    dateKey: {
      type: String,
      required: true,
      match: [/^\d{4}-\d{2}-\d{2}$/, "Date must be in YYYY-MM-DD format"],
    },
    center: { type: mongoose.Schema.Types.ObjectId, ref: "ServiceCenter", required: true },
    service: { type: mongoose.Schema.Types.ObjectId, ref: "Service", required: true },
    counter: { type: mongoose.Schema.Types.ObjectId, ref: "Counter", default: null },
    farmer: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
    walkInName: { type: String, trim: true, maxlength: 80 },
    walkInPhone: {
      type: String,
      trim: true,
      match: [/^[6-9]\d{9}$/, "Please enter a valid 10-digit mobile number"],
    },
    source: { type: String, enum: ["online", "walk_in"], default: "online" },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
    status: { type: String, enum: TOKEN_STATUSES, default: "waiting" },
    isActive: { type: Boolean, default: true },
    queuedAt: { type: Date, default: Date.now },
    estimatedWaitMinutes: { type: Number, min: 0, default: 0 },
    skipCount: { type: Number, min: 0, default: 0 },
    calledAt: Date,
    servingStartedAt: Date,
    completedAt: Date,
    cancelledAt: Date,
    skippedAt: Date,
    cancelReason: { type: String, trim: true, maxlength: 200 },
    notes: { type: String, trim: true, maxlength: 300 },
  },
  { timestamps: true }
);

tokenSchema.pre("validate", async function () {
  if (!this.farmer && !this.walkInName) {
    this.invalidate("farmer", "A token needs either a registered farmer or a walk-in name");
  }
});

tokenSchema.pre("save", async function () {
  this.isActive = ACTIVE_STATUSES.includes(this.status);
});

tokenSchema.index({ center: 1, dateKey: 1, tokenNumber: 1 }, { unique: true });
tokenSchema.index({ center: 1, dateKey: 1, status: 1 });
tokenSchema.index({ counter: 1, status: 1, queuedAt: 1 });
tokenSchema.index({ farmer: 1, createdAt: -1 });
tokenSchema.index(
  { farmer: 1 },
  {
    unique: true,
    partialFilterExpression: { isActive: true, farmer: { $type: "objectId" } },
  }
);

const Token = mongoose.model("Token", tokenSchema);
export default Token;