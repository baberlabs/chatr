import { Router } from "express";
import {
  getAllUsers,
  getUserById,
  updateUserProfile,
  deleteUser,
  getOnlineUsers,
} from "../controllers/user.controller.js";
import { authenticateUser } from "../middleware/auth.middleware.js";

const router = Router();

router.get("/", authenticateUser, getAllUsers);
router.get("/online", authenticateUser, getOnlineUsers);
router.get("/:id", authenticateUser, getUserById);
router.put("/:id", authenticateUser, updateUserProfile);
router.delete("/:id", authenticateUser, deleteUser);

export default router;
