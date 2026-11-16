import { Router } from "express";
import { param, query } from "express-validator";
import {
  getNotifications,
  markNotificationRead,
  markAllNotificationsRead,
} from "../controllers/notificationController.js";
import { protect } from "../middleware/authMiddleware.js";
import { validate } from "../middleware/validate.js";

const router = Router();

const listRules = [
  query("limit").optional().isInt({ min: 1, max: 100 }).withMessage("Limit must be between 1 and 100"),
  query("unread").optional().isIn(["true", "false"]).withMessage("unread must be true or false"),
];

const idRule = param("id").isMongoId().withMessage("Invalid notification id");

router.use(protect);
router.get("/", listRules, validate, getNotifications);
router.patch("/read-all", markAllNotificationsRead);
router.patch("/:id/read", idRule, validate, markNotificationRead);

export default router;