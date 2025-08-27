import jwt from "jsonwebtoken";

import { createError, ErrorCodes } from "../errors.js";

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
