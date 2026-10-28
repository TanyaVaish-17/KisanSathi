import mongoose from "mongoose";

const timePattern = /^([01]\d|2[0-3]):[0-5]\d$/;

const serviceCenterSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Center name is required"],
      trim: true,
      maxlength: [120, "Center name cannot exceed 120 characters"],
    },
    type: {
      type: String,
      enum: ["mandi", "procurement_center"],
      default: "mandi",
    },
    address: {
      type: String,
      required: [true, "Address is required"],
      trim: true,
    },
    district: {
      type: String,
      required: [true, "District is required"],
      trim: true,
    },
    state: { type: String, trim: true, default: "Uttar Pradesh" },
    latitude: { type: Number, min: -90, max: 90 },
    longitude: { type: Number, min: -180, max: 180 },
    openTime: {
      type: String,
      default: "09:00",
      match: [timePattern, "Opening time must be in HH:mm format"],
    },
    closeTime: {
      type: String,
      default: "17:00",
      match: [timePattern, "Closing time must be in HH:mm format"],
    },
    workingDays: {
      type: [Number],
      default: [1, 2, 3, 4, 5, 6],
      validate: {
        validator: (days) => days.every((d) => Number.isInteger(d) && d >= 0 && d <= 6),
        message: "Working days must be numbers from 0 (Sunday) to 6 (Saturday)",
      },
    },
    status: {
      type: String,
      enum: ["active", "inactive"],
      default: "active",
    },
  },
  { timestamps: true }
);

serviceCenterSchema.index({ name: 1, district: 1 }, { unique: true });
serviceCenterSchema.index({ status: 1, district: 1 });

const ServiceCenter = mongoose.model("ServiceCenter", serviceCenterSchema);
export default ServiceCenter;