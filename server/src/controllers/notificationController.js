import Notification from "../models/Notification.js";
import asyncHandler from "../utils/asyncHandler.js";

export const getNotifications = asyncHandler(async (req, res) => {
  const limit = Math.min(Math.max(Number(req.query.limit) || 30, 1), 100);
  const filter = { recipient: req.user._id };
  if (req.query.unread === "true") filter.isRead = false;

  const [notifications, unreadCount] = await Promise.all([
    Notification.find(filter).sort({ createdAt: -1 }).limit(limit),
    Notification.countDocuments({ recipient: req.user._id, isRead: false }),
  ]);

  res.json({ success: true, unreadCount, notifications });
});

export const markNotificationRead = asyncHandler(async (req, res) => {
  const notification = await Notification.findOneAndUpdate(
    { _id: req.params.id, recipient: req.user._id },
    { $set: { isRead: true, readAt: new Date() } },
    { returnDocument: "after" }
  );

  if (!notification) {
    res.status(404);
    throw new Error("Notification not found");
  }

  const unreadCount = await Notification.countDocuments({
    recipient: req.user._id,
    isRead: false,
  });

  res.json({ success: true, notification, unreadCount });
});

export const markAllNotificationsRead = asyncHandler(async (req, res) => {
  const result = await Notification.updateMany(
    { recipient: req.user._id, isRead: false },
    { $set: { isRead: true, readAt: new Date() } }
  );

  res.json({ success: true, updated: result.modifiedCount, unreadCount: 0 });
});