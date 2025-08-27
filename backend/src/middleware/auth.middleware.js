import { UserService } from "../services/domain/user.service.js";
import { extractToken } from "../utils/extractToken.js";
import { verifyToken } from "../utils/verifyToken.js";
import { ErrorCodes, createError } from "../errors.js";

export const authenticateUser = async (req, res, next) => {
  const token = extractToken(req);
  if (!token) {
    throw createError(ErrorCodes.AUTH_TOKEN_REQUIRED);
  }
  const decodedToken = verifyToken(token);
  const user = await UserService.getUserById(decodedToken.userId);
  req.user = user;
  next();
};
