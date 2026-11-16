import { Router } from "express";
import { body, query } from "express-validator";
import { createFeedback, getMyFeedback, getAllFeedback } from "../controllers/feedbackController.js";
import { protect, authorize } from "../middleware/authMiddleware.js";
import { validate } from "../middleware/validate.js";

const router = Router();

const createRules = [
  body("token").isMongoId().withMessage("A valid token is required"),
  body("rating").isInt({ min: 1, max: 5 }).withMessage("Rating must be between 1 and 5"),
  body("comment").optional({ values: "falsy" }).trim().isLength({ max: 500 }).withMessage("Comment cannot exceed 500 characters"),
];

const listRules = [
  query("center").optional().isMongoId().withMessage("Invalid center id"),
  query("rating").optional().isInt({ min: 1, max: 5 }).withMessage("Rating must be between 1 and 5"),
  query("limit").optional().isInt({ min: 1, max: 200 }).withMessage("Limit must be between 1 and 200"),
];

router.use(protect);
router.post("/", authorize("farmer"), createRules, validate, createFeedback);
router.get("/mine", authorize("farmer"), getMyFeedback);
router.get("/", authorize("admin"), listRules, validate, getAllFeedback);

export default router;