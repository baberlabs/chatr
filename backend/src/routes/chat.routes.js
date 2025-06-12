import { Router } from "express";
import {
  createChat,
  getChatById,
  deleteChat,
  createGroupChat,
  updateGroupChat,
  leaveGroupChat,
} from "../controllers/chat.controller.js";
import { authenticateUser } from "../middleware/auth.middleware.js";

const router = Router();

router.post("/", authenticateUser, createChat);
router.get("/:chatId", authenticateUser, getChatById);
router.delete("/:chatId", authenticateUser, deleteChat);
router.post("/group", authenticateUser, createGroupChat);
router.put("/group/:id", authenticateUser, updateGroupChat);
router.put("/group/leave/:id", authenticateUser, leaveGroupChat);

export default router;
