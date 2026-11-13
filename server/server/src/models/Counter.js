import mongoose from "mongoose";

const counterSchema = new mongoose.Schema(
  {
    center: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "ServiceCenter",
      required: [true, "Center is required"],
    },
    name: {
      type: String,
      required: [true, "Counter name is required"],
      trim: true,
      maxlength: [50, "Counter name cannot exceed 50 characters"],
    },
    service: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Service",
      required: [true, "Supported service is required"],
    },
    operator: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    status: {
      type: String,
      enum: ["active", "paused", "inactive"],
      default: "active",
    },
    currentToken: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Token",
      default: null,
    },
  },
  { timestamps: true }
);

counterSchema.index({ center: 1, name: 1 }, { unique: true });
counterSchema.index({ center: 1, service: 1, status: 1 });
counterSchema.index(
  { operator: 1 },
  { unique: true, partialFilterExpression: { operator: { $type: "objectId" } } }
);

const Counter = mongoose.model("Counter", counterSchema);
export default Counter;