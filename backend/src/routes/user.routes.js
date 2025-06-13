import { Router } from "express";
import {
  getAllUsers,
  getUserById,
  updateUserProfile,
  deleteUser,
} from "../controllers/user.controller.js";
import { authenticateUser } from "../middleware/auth.middleware.js";
import { catchAsync } from "../utils/catchAsync.js";

const router = Router();

router.get("/", authenticateUser, catchAsync(getAllUsers));
router.get("/:id", authenticateUser, catchAsync(getUserById));
router.put("/:id", authenticateUser, catchAsync(updateUserProfile));
router.delete("/:id", authenticateUser, catchAsync(deleteUser));

export default router;
