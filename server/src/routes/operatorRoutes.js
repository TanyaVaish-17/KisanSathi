import { Router } from "express";
import { body, param } from "express-validator";
import { getQueue, callNext, updateTokenStatus } from "../controllers/operatorController.js";
import { protect, authorize } from "../middleware/authMiddleware.js";
import { validate } from "../middleware/validate.js";

const router = Router();

const idRule = param("id").isMongoId().withMessage("Invalid token id");
const statusRules = [
  body("status")
    .isIn(["completed", "skipped", "no_show"])
    .withMessage("Status must be completed, skipped or no_show"),
];

router.use(protect, authorize("operator"));

router.get("/queue", getQueue);
router.post("/call-next", callNext);
router.patch("/tokens/:id/status", idRule, statusRules, validate, updateTokenStatus);

export default router;