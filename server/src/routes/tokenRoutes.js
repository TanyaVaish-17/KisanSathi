import { Router } from "express";
import { body, param } from "express-validator";
import { cancelToken, createToken, getMyTokens } from "../controllers/tokenController.js";
import { protect, authorize } from "../middleware/authMiddleware.js";
import { validate } from "../middleware/validate.js";

const router = Router();

const createRules = [
  body("center").isMongoId().withMessage("A valid center is required"),
  body("service").isMongoId().withMessage("A valid service is required"),
];

const idRule = param("id").isMongoId().withMessage("Invalid token id");

router.use(protect, authorize("farmer"));
router.get("/mine", getMyTokens);
router.post("/", createRules, validate, createToken);
router.patch("/:id/cancel", idRule, validate, cancelToken);

export default router;
