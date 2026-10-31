import { Router } from "express";
import { body, param, query } from "express-validator";
import {
  getCounters,
  getAllCounters,
  getOperators,
  getMyCounter,
  createCounter,
  updateCounter,
  updateCounterStatus,
  deleteCounter,
} from "../controllers/counterController.js";
import { protect, authorize } from "../middleware/authMiddleware.js";
import { validate } from "../middleware/validate.js";

const router = Router();

const idRule = param("id").isMongoId().withMessage("Invalid counter id");
const centerQueryRule = query("center").optional().isMongoId().withMessage("Invalid center id");

const createRules = [
  body("center").isMongoId().withMessage("A valid center is required"),
  body("name").trim().notEmpty().withMessage("Counter name is required"),
  body("service").isMongoId().withMessage("A valid service is required"),
  body("operator").optional({ values: "null" }).isMongoId().withMessage("Invalid operator"),
];

const updateRules = [
  body("name").optional().trim().notEmpty().withMessage("Counter name cannot be empty"),
  body("service").optional().isMongoId().withMessage("Invalid service"),
  body("operator").optional({ values: "null" }).isMongoId().withMessage("Invalid operator"),
];

const statusRules = [
  body("status").isIn(["active", "paused", "inactive"]).withMessage("Invalid status"),
];

router.get("/", centerQueryRule, validate, getCounters);
router.get("/admin/all", protect, authorize("admin"), centerQueryRule, validate, getAllCounters);
router.get("/operators", protect, authorize("admin"), getOperators);
router.get("/mine", protect, authorize("operator"), getMyCounter);

router.post("/", protect, authorize("admin"), createRules, validate, createCounter);
router.put("/:id", protect, authorize("admin"), idRule, updateRules, validate, updateCounter);
router.patch(
  "/:id/status",
  protect,
  authorize("admin", "operator"),
  idRule,
  statusRules,
  validate,
  updateCounterStatus
);
router.delete("/:id", protect, authorize("admin"), idRule, validate, deleteCounter);

export default router;