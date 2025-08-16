/**
 * Errors are caught with catchAsync on the routes
 * themselves, hence, no try-catch is needed here.
 */

import { AuthService } from "../services/domain/auth.service.js";
import { userResponse } from "../utils/responses.js";
import { generateJWT } from "../utils/generateJWT.js";

export const registerUser = async (req, res) => {
  const { fullName, email, password } = req.body;
  const user = await AuthService.registerUser(fullName, email, password);
  generateJWT(user._id, res);
  res.status(201).json({ user: userResponse(user) });
};

export const loginUser = async (req, res) => {
  const { email, password } = req.body;
  const user = await AuthService.loginUser(email, password);
  generateJWT(user._id, res);
  res.status(200).json({ user: userResponse(user) });
};

export const logoutUser = (req, res) => {
  res.clearCookie("jwt", {
    httpOnly: true,
    sameSite: "strict",
    secure: process.env.NODE_ENV === "production",
    path: "/",
  });
  res.sendStatus(204);
};

export const checkAuthStatus = (req, res) => res.sendStatus(204);
