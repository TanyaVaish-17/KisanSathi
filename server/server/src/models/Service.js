import mongoose from "mongoose";

const serviceSchema = new mongoose.Schema(
  {
    center: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "ServiceCenter",
      required: [true, "Center is required"],
    },
    name: {
      type: String,
      required: [true, "Service name is required"],
      trim: true,
      maxlength: [100, "Service name cannot exceed 100 characters"],
    },
    nameHi: { type: String, trim: true },
    description: { type: String, trim: true, maxlength: 500 },
    estimatedDuration: {
      type: Number,
      required: [true, "Estimated duration is required"],
      min: [1, "Duration must be at least 1 minute"],
      max: [240, "Duration cannot exceed 240 minutes"],
      default: 10,
    },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

serviceSchema.index({ center: 1, name: 1 }, { unique: true });

const Service = mongoose.model("Service", serviceSchema);
export default Service;