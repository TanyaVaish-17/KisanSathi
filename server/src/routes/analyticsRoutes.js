import { Router } from "express";
import { query } from "express-validator";
import { getAnalytics } from "../controllers/analyticsController.js";
import { protect, authorize } from "../middleware/authMiddleware.js";
import { validate } from "../middleware/validate.js";

const router = Router();

const datePattern = /^\d{4}-\d{2}-\d{2}$/;

const rules = [
  query("from").optional().matches(datePattern).withMessage("From must be a date like 2026-11-17"),
  query("to").optional().matches(datePattern).withMessage("To must be a date like 2026-11-17"),
  query("center").optional().isMongoId().withMessage("Invalid center id"),
];

router.get("/", protect, authorize("admin"), rules, validate, getAnalytics);

export default router;