import { Router } from "express";
import {
  sendMessage,
  getMessagesByChatId,
  deleteMessage,
} from "../controllers/message.controller.js";
import { authenticateUser } from "../middleware/auth.middleware.js";

const router = Router();

router.post("/", authenticateUser, sendMessage);
router.get("/:chatId", authenticateUser, getMessagesByChatId);
router.delete("/:id", authenticateUser, deleteMessage);

export default router;
