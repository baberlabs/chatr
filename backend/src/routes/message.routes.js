import { Router } from "express";
import {
  sendMessage,
  getMessagesByChatId,
  deleteMessage,
} from "../controllers/message.controller.js";
import { authenticateUser } from "../middleware/auth.middleware.js";
import { catchAsync } from "../utils/catchAsync.js";

const router = Router();

router.post("/", authenticateUser, catchAsync(sendMessage));
router.get("/:chatId", authenticateUser, catchAsync(getMessagesByChatId));
router.delete("/:messageId", authenticateUser, catchAsync(deleteMessage));

export default router;
