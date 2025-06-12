import { Router } from "express";
import {
  registerUser,
  loginUser,
  logoutUser,
  getCurrentUser,
  checkAuthStatus,
} from "../controllers/auth.controller.js";
import { authenticateUser } from "../middleware/auth.middleware.js";
import { catchAsync } from "../utils/catchAsync.js";

const router = Router();

router.post("/register", catchAsync(registerUser));
router.post("/login", catchAsync(loginUser));
router.post("/logout", catchAsync(logoutUser));
router.get("/me", authenticateUser, catchAsync(getCurrentUser));
router.get("/status", authenticateUser, catchAsync(checkAuthStatus));

export default router;
