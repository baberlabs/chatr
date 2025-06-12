import bcrypt from "bcryptjs";

import { AppError } from "../utils/AppError.js";
import { generateJWT } from "../utils/generateJWT.js";

import User from "../models/user.model.js";

export const registerUser = async (req, res) => {
  const { fullName, email, password } = req.body;

  if (!fullName) throw new AppError("Full name is required", 400);

  if (!email) throw new AppError("Email is required", 400);

  if (!password) throw new AppError("Password is required", 400);

  const trimmedFullName = fullName.trim();
  const trimmedEmail = email.trim().toLowerCase();
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (!emailRegex.test(trimmedEmail)) throw new AppError("Invalid email", 400);

  if (password.length < 8)
    throw new AppError("Password should be at least 8 characters long", 400);

  if (trimmedFullName.length < 3)
    throw new AppError("Full name should be at least 3 characters long", 400);

  if (trimmedFullName.length > 50)
    throw new AppError("Full name should be less than 50 characters long", 400);

  const existingUser = await User.findOne({ email: trimmedEmail });

  if (existingUser) throw new AppError("Email already exists", 409);

  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);

  const newUser = new User({
    fullName: trimmedFullName,
    email: trimmedEmail,
    password: hashedPassword,
  });

  await newUser.save();
  generateJWT(newUser._id, res);

  return res.status(201).json({
    message: "User registered successfully",
    user: {
      _id: newUser._id,
      fullName: newUser.fullName,
      email: newUser.email,
      profilePic: newUser.profilePic,
      isVerified: newUser.isVerified,
    },
  });
};

export const loginUser = async (req, res) => {
  const { email, password } = req.body;

  if (!email) throw new AppError("Email is required", 400);
  if (!password) throw new AppError("Password is required", 400);

  const trimmedEmail = email.trim().toLowerCase();
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (!emailRegex.test(trimmedEmail)) throw new AppError("Invalid email", 400);

  const user = await User.findOne({ email });

  if (!user) throw new AppError("Invalid credentials", 401);

  const isPasswordValid = await bcrypt.compare(password, user.password);

  if (!isPasswordValid) throw new AppError("Invalid credentials", 401);

  generateJWT(user._id, res);

  return res.status(200).json({
    message: "User logged in successfully",
    user: {
      _id: user._id,
      fullName: user.fullName,
      email: user.email,
      profilePic: user.profilePic,
      isVerified: user.isVerified,
    },
  });
};

export const logoutUser = (req, res) => {
  res.cookie("jwt", "", {
    maxAge: 0,
    httpOnly: true,
    sameSite: "strict",
    secure: process.env.NODE_ENV === "production",
  });

  return res.status(200).json({ message: "User logged out successfully" });
};

export const checkAuthStatus = async (req, res) => {
  return res.status(200).json({
    message: "Authorised - Valid Token",
    user: req.user,
  });
};
