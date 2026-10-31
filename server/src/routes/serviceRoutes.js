import { Router } from "express";
import { body, param, query } from "express-validator";
import {
  getServices,
  getAllServices,
  createService,
  updateService,
  deleteService,
} from "../controllers/serviceController.js";
import { protect, authorize } from "../middleware/authMiddleware.js";
import { validate } from "../middleware/validate.js";

const router = Router();

const idRule = param("id").isMongoId().withMessage("Invalid service id");
const centerQueryRule = query("center").optional().isMongoId().withMessage("Invalid center id");

const durationRule = (rule) =>
  rule.isInt({ min: 1, max: 240 }).withMessage("Duration must be between 1 and 240 minutes");

const createRules = [
  body("center").isMongoId().withMessage("A valid center is required"),
  body("name").trim().notEmpty().withMessage("Service name is required"),
  durationRule(body("estimatedDuration")),
];

const updateRules = [
  body("name").optional().trim().notEmpty().withMessage("Service name cannot be empty"),
  durationRule(body("estimatedDuration").optional()),
];

router.get("/", centerQueryRule, validate, getServices);
router.get("/admin/all", protect, authorize("admin"), centerQueryRule, validate, getAllServices);

router.post("/", protect, authorize("admin"), createRules, validate, createService);
router.put("/:id", protect, authorize("admin"), idRule, updateRules, validate, updateService);
router.delete("/:id", protect, authorize("admin"), idRule, validate, deleteService);

export default router;