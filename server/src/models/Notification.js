import mongoose from "mongoose";

export const NOTIFICATION_TYPES = [
  "token_created",
  "token_called",
  "token_completed",
  "token_skipped",
  "token_no_show",
  "token_cancelled",
  "queue_progress",
  "delay",
];

const notificationSchema = new mongoose.Schema(
  {
    recipient: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    type: { type: String, enum: NOTIFICATION_TYPES, required: true },
    title: { type: String, required: true, trim: true, maxlength: 120 },
    message: { type: String, required: true, trim: true, maxlength: 500 },
    messageHi: { type: String, trim: true, maxlength: 500 },
    token: { type: mongoose.Schema.Types.ObjectId, ref: "Token", default: null },
    isRead: { type: Boolean, default: false },
    readAt: Date,
  },
  { timestamps: true }
);

notificationSchema.index({ recipient: 1, createdAt: -1 });
notificationSchema.index({ recipient: 1, isRead: 1 });

const Notification = mongoose.model("Notification", notificationSchema);
export default Notification;