import { UserService } from "../services/domain/user.service.js";
import { extractToken } from "../utils/extractToken.js";
import { verifyToken } from "../utils/verifyToken.js";

export const authenticateUser = async (socket, next) => {
  try {
    const token = extractToken({ socket });
    const decodedToken = verifyToken(token);
    const user = await UserService.getUserById(decodedToken.userId);
    socket.user = user;
    next();
  } catch (error) {
    console.log("Socket authentication error:", error);
    next(error);
  }
};
