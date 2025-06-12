import { Router } from "express";
import {
  registerUser,
  loginUser,
  logoutUser,
  getCurrentUser,
  checkAuthStatus,
} from "../controllers/auth.controller.js";
import { authenticateUser } from "../middleware/auth.middleware.js";

const router = Router();

router.post("/register", registerUser);
router.post("/login", loginUser);
router.post("/logout", authenticateUser, logoutUser);
router.get("/me", authenticateUser, getCurrentUser);
router.get("/status", authenticateUser, checkAuthStatus);

export default router;
