import { Router } from "express";
import { body, param } from "express-validator";
import {
  createToken,
  getMyTokens,
  getTokenById,
  cancelToken,
} from "../controllers/tokenController.js";
import { protect, authorize } from "../middleware/authMiddleware.js";
import { validate } from "../middleware/validate.js";

const router = Router();

const idRule = param("id").isMongoId().withMessage("Invalid token id");

const createRules = [
  body("center").isMongoId().withMessage("A valid center is required"),
  body("service").isMongoId().withMessage("A valid service is required"),
];

const cancelRules = [
  body("reason").optional().trim().isLength({ max: 200 }).withMessage("Reason cannot exceed 200 characters"),
];

router.post("/", protect, authorize("farmer"), createRules, validate, createToken);
router.get("/mine", protect, authorize("farmer"), getMyTokens);
router.get("/:id", protect, idRule, validate, getTokenById);
router.patch("/:id/cancel", protect, authorize("farmer"), idRule, cancelRules, validate, cancelToken);

export default router;