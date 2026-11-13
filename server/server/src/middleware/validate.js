import { validationResult } from "express-validator";

export const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (errors.isEmpty()) return next();

  res.status(400);
  next(new Error(errors.array().map((e) => e.msg).join(", ")));
};