import { UserService } from "../services/domain/user.service.js";
import { extractToken } from "../utils/extractToken.js";
import { verifyToken } from "../utils/verifyToken.js";

export const authenticateUser = async (req, res, next) => {
  const token = extractToken({ req });
  const decodedToken = verifyToken(token);
  const user = await UserService.getUserById(decodedToken.userId);
  req.user = user;
  next();
};
