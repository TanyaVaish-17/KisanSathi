import { Router } from "express";
import { body, param } from "express-validator";
import {
  getCenters,
  getCenterById,
  getAllCenters,
  createCenter,
  updateCenter,
  deleteCenter,
} from "../controllers/centerController.js";
import { protect, authorize } from "../middleware/authMiddleware.js";
import { validate } from "../middleware/validate.js";

const router = Router();

const idRule = param("id").isMongoId().withMessage("Invalid center id");

const createRules = [
  body("name").trim().notEmpty().withMessage("Center name is required"),
  body("address").trim().notEmpty().withMessage("Address is required"),
  body("district").trim().notEmpty().withMessage("District is required"),
  body("type").optional().isIn(["mandi", "procurement_center"]).withMessage("Invalid center type"),
  body("status").optional().isIn(["active", "inactive"]).withMessage("Invalid status"),
];

const updateRules = [
  body("name").optional().trim().notEmpty().withMessage("Center name cannot be empty"),
  body("address").optional().trim().notEmpty().withMessage("Address cannot be empty"),
  body("district").optional().trim().notEmpty().withMessage("District cannot be empty"),
  body("type").optional().isIn(["mandi", "procurement_center"]).withMessage("Invalid center type"),
  body("status").optional().isIn(["active", "inactive"]).withMessage("Invalid status"),
];

router.get("/", getCenters);
router.get("/admin/all", protect, authorize("admin"), getAllCenters);
router.get("/:id", idRule, validate, getCenterById);

router.post("/", protect, authorize("admin"), createRules, validate, createCenter);
router.put("/:id", protect, authorize("admin"), idRule, updateRules, validate, updateCenter);
router.delete("/:id", protect, authorize("admin"), idRule, validate, deleteCenter);

export default router;