import { Router } from "express";
import { query } from "express-validator";
import { getAuditLogs } from "../controllers/auditController.js";
import { protect, authorize } from "../middleware/authMiddleware.js";
import { validate } from "../middleware/validate.js";

const router = Router();

const datePattern = /^\d{4}-\d{2}-\d{2}$/;

const listRules = [
  query("category").optional().isIn(["queue", "admin"]).withMessage("Category must be queue or admin"),
  query("action").optional().matches(/^[a-z_]+$/).withMessage("Invalid action"),
  query("center").optional().isMongoId().withMessage("Invalid center id"),
  query("actor").optional().isMongoId().withMessage("Invalid actor id"),
  query("from").optional().matches(datePattern).withMessage("From must be a date like 2026-11-17"),
  query("to").optional().matches(datePattern).withMessage("To must be a date like 2026-11-17"),
  query("page").optional().isInt({ min: 1 }).withMessage("Page must be 1 or more"),
  query("limit").optional().isInt({ min: 1, max: 200 }).withMessage("Limit must be between 1 and 200"),
];

router.get("/", protect, authorize("admin"), listRules, validate, getAuditLogs);

export default router;