import User from "../models/User.js";
import asyncHandler from "../utils/asyncHandler.js";
import generateToken from "../utils/generateToken.js";

const userResponse = (user) => ({
  id: user._id,
  name: user.name,
  email: user.email,
  phone: user.phone,
  role: user.role,
  preferredLanguage: user.preferredLanguage,
  village: user.village,
  district: user.district,
});

// Register
export const register = asyncHandler(async (req, res) => {
  const { name, email, phone, password, preferredLanguage, village, district } = req.body;

  const conditions = [];
  if (email) conditions.push({ email: email.toLowerCase() });
  if (phone) conditions.push({ phone });

  const existing = await User.findOne({ $or: conditions });
  if (existing) {
    res.status(409);
    throw new Error("An account with this email or phone already exists");
  }

  const user = await User.create({
    name,
    email: email || undefined,
    phone: phone || undefined,
    password,
    preferredLanguage,
    village,
    district,
    role: "farmer",
  });

  res.status(201).json({
    success: true,
    token: generateToken(user),
    user: userResponse(user),
  });
});

// Login
export const login = asyncHandler(async (req, res) => {
  const { identifier, password } = req.body;

  const user = await User.findOne({
    $or: [{ email: identifier.toLowerCase() }, { phone: identifier }],
  }).select("+password");

  if (!user || !(await user.matchPassword(password))) {
    res.status(401);
    throw new Error("Invalid email/phone or password");
  }

  if (!user.isActive) {
    res.status(403);
    throw new Error("This account has been deactivated");
  }

  res.json({
    success: true,
    token: generateToken(user),
    user: userResponse(user),
  });
});

// Current user
export const getMe = (req, res) => {
  res.json({ success: true, user: userResponse(req.user) });
};