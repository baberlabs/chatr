import jwt from "jsonwebtoken";
import dotenv from "dotenv";

import User from "../models/user.model.js";
import { ErrorCodes, createError } from "../errors.js";
import mongoose from "mongoose";

dotenv.config();

export const authenticateUser = async (req, res, next) => {
  const token = extractToken(req);
  if (!token) {
    throw createError(ErrorCodes.AUTH_TOKEN_REQUIRED);
  }
  const decodedToken = verifyToken(token);
  const user = await fetchUser(decodedToken.userId);
  req.user = user;
  next();
};

export const extractToken = (req) => {
  if (req.cookies?.jwt) {
    return req.cookies.jwt;
  }
  return null;
};

export const verifyToken = (token) => {
  try {
    return jwt.verify(token, process.env.JWT_SECRET);
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      throw createError(ErrorCodes.AUTH_TOKEN_EXPIRED);
    }
    if (error.name === "JsonWebTokenError") {
      throw createError(ErrorCodes.AUTH_TOKEN_INVALID);
    }
    throw createError(ErrorCodes.AUTH_TOKEN_INVALID);
  }
};

const fetchUser = async (userId) => {
  if (!userId) {
    throw createError(ErrorCodes.AUTH_TOKEN_INVALID, "Token missing user ID");
  }
  if (!mongoose.Types.ObjectId.isValid(userId)) {
    throw createError(ErrorCodes.USER_ID_INVALID);
  }
  const user = await User.findById(userId).select("-password").lean();
  if (!user) {
    throw createError(ErrorCodes.USER_NOT_FOUND);
  }
  return user;
};
