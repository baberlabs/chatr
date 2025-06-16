import { Router } from "express";
import {
  getAllChats,
  createChat,
  getChatById,
  deleteChat,
  createGroupChat,
  updateGroupChat,
  leaveGroupChat,
} from "../controllers/chat.controller.js";
import { authenticateUser } from "../middleware/auth.middleware.js";
import { catchAsync } from "../utils/catchAsync.js";

const router = Router();

router.get("/", authenticateUser, catchAsync(getAllChats));
router.post("/", authenticateUser, catchAsync(createChat));
router.get("/:chatId", authenticateUser, catchAsync(getChatById));
router.delete("/:chatId", authenticateUser, catchAsync(deleteChat));
router.post("/group", authenticateUser, catchAsync(createGroupChat));
router.put("/group/:id", authenticateUser, catchAsync(updateGroupChat));
router.put("/group/leave/:id", authenticateUser, catchAsync(leaveGroupChat));

export default router;
