import jwt from "jsonwebtoken";
import User from "../models/User.js";
import asyncHandler from "../utils/asyncHandler.js";

// Protect routes
export const protect = asyncHandler(async (req, res, next) => {
  const header = req.headers.authorization;

  if (!header || !header.startsWith("Bearer ")) {
    res.status(401);
    throw new Error("Not authorized, no token");
  }

  let decoded;
  try {
    decoded = jwt.verify(header.split(" ")[1], process.env.JWT_SECRET);
  } catch {
    res.status(401);
    throw new Error("Not authorized, token is invalid or expired");
  }

  const user = await User.findById(decoded.id);
  if (!user || !user.isActive) {
    res.status(401);
    throw new Error("Not authorized, user not found or deactivated");
  }

  req.user = user;
  next();
});

// Role check
export const authorize =
  (...roles) =>
  (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      res.status(403);
      return next(new Error("You do not have permission to perform this action"));
    }
    next();
  };