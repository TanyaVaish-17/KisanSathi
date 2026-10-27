import { Router } from "express";
import { body } from "express-validator";
import { register, login } from "../controllers/authController.js";
import { validate } from "../middleware/validate.js";

const router = Router();

const registerRules = [
  body("name").trim().isLength({ min: 2 }).withMessage("Name must be at least 2 characters"),
  body("email").optional({ values: "falsy" }).isEmail().withMessage("Enter a valid email"),
  body("phone")
    .optional({ values: "falsy" })
    .matches(/^[6-9]\d{9}$/)
    .withMessage("Enter a valid 10-digit mobile number"),
  body("password").isLength({ min: 6 }).withMessage("Password must be at least 6 characters"),
  body().custom((value) => {
    if (!value.email && !value.phone) {
      throw new Error("Email or phone number is required");
    }
    return true;
  }),
];

const loginRules = [
  body("identifier").trim().notEmpty().withMessage("Email or phone number is required"),
  body("password").notEmpty().withMessage("Password is required"),
];

router.post("/register", registerRules, validate, register);
router.post("/login", loginRules, validate, login);

export default router;