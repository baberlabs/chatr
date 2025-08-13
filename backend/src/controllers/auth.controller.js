// Errors are caught with src/utils/catchAsync.js

import bcrypt from "bcryptjs";

import User from "../models/user.model.js";
import { generateJWT } from "../utils/generateJWT.js";
import { userResponse } from "./helpers/response.helpers.js";
import { isValidEmail } from "../utils/helpers.js";
import { ErrorCodes, createError } from "../errors.js";

export const registerUser = async (req, res) => {
  const fullName = req.body.fullName?.trim();
  const email = req.body.email?.trim().toLowerCase();
  const password = req.body.password?.trim();

  if (!fullName) {
    throw createError(ErrorCodes.USER_FULLNAME_REQUIRED);
  }

  if (!email) {
    throw createError(ErrorCodes.USER_EMAIL_REQUIRED);
  }

  if (!password) {
    throw createError(ErrorCodes.USER_PASSWORD_REQUIRED);
  }

  if (fullName.length < 3) {
    throw createError(ErrorCodes.USER_FULLNAME_TOO_SHORT);
  }

  if (fullName.length > 50) {
    throw createError(ErrorCodes.USER_FULLNAME_TOO_LONG);
  }

  if (!isValidEmail(email)) {
    throw createError(ErrorCodes.USER_EMAIL_INVALID);
  }

  if (password.length < 8) {
    throw createError(ErrorCodes.USER_PASSWORD_TOO_SHORT);
  }

  if (await User.findOne({ email })) {
    throw createError(ErrorCodes.USER_EMAIL_ALREADY_EXISTS);
  }

  const newUser = new User({
    fullName,
    email,
    password: await bcrypt.hash(password, 10),
  });

  await newUser.save();

  generateJWT(newUser._id, res);

  res.status(201).json({
    message: "User registered",
    data: {
      user: userResponse(newUser),
    },
  });
};

export const loginUser = async (req, res) => {
  const email = req.body.email?.trim().toLowerCase();
  const password = req.body.password?.trim();

  if (!email) {
    throw createError(ErrorCodes.USER_EMAIL_REQUIRED);
  }

  if (!password) {
    throw createError(ErrorCodes.USER_PASSWORD_REQUIRED);
  }

  if (!isValidEmail(email)) {
    throw createError(ErrorCodes.USER_EMAIL_INVALID);
  }

  if (password.length < 8) {
    throw createError(ErrorCodes.USER_PASSWORD_TOO_SHORT);
  }

  const user = await User.findOne({ email });

  if (!user) {
    throw createError(ErrorCodes.AUTH_CREDENTIALS_INVALID);
  }

  const isPasswordMatch = await bcrypt.compare(password, user.password);

  if (!isPasswordMatch) {
    throw createError(ErrorCodes.AUTH_CREDENTIALS_INVALID);
  }

  generateJWT(user._id, res);

  res.status(200).json({
    message: "User logged in",
    data: {
      user: userResponse(user),
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
  res.status(200).json({ message: "User logged out" });
};

export const checkAuthStatus = (req, res) => {
  res.status(200).json({
    message: "User authenticated",
    data: {
      user: userResponse(req.user),
    },
  });
};
