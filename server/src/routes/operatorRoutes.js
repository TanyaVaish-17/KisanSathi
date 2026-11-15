import { Router } from "express";
import { body, param } from "express-validator";
import {
  getQueue,
  callNext,
  updateTokenStatus,
  registerWalkIn,
  transferWaiting,
} from "../controllers/operatorController.js";
import { protect, authorize } from "../middleware/authMiddleware.js";
import { validate } from "../middleware/validate.js";

const router = Router();

const idRule = param("id").isMongoId().withMessage("Invalid token id");
const statusRules = [
  body("status")
    .isIn(["completed", "skipped", "no_show"])
    .withMessage("Status must be completed, skipped or no_show"),
];

const walkInRules = [
  body("walkInName")
    .trim()
    .isLength({ min: 2, max: 80 })
    .withMessage("Name must be between 2 and 80 characters"),
  body("walkInPhone")
    .optional({ values: "falsy" })
    .matches(/^[6-9]\d{9}$/)
    .withMessage("Enter a valid 10-digit mobile number"),
  body("service").optional().isMongoId().withMessage("Invalid service"),
  body("notes").optional().trim().isLength({ max: 300 }).withMessage("Notes cannot exceed 300 characters"),
];

router.use(protect, authorize("operator"));

router.get("/queue", getQueue);
router.post("/call-next", callNext);
router.post("/walk-ins", walkInRules, validate, registerWalkIn);
router.post("/transfer-waiting", transferWaiting);
router.patch("/tokens/:id/status", idRule, statusRules, validate, updateTokenStatus);

export default router;