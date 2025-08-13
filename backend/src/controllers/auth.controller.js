/**
 * Errors are caught with catchAsync on the routes
 * themselves, hence, no try-catch is needed here.
 */

import { AuthService } from "../services/auth.service.js";
import { userResponse } from "../utils/responses.js";
import { generateJWT } from "../utils/generateJWT.js";

export const registerUser = async (req, res) => {
  const { fullName, email, password } = req.body;

  const user = await AuthService.registerUser(fullName, email, password);

  generateJWT(user._id, res);

  res.status(201).json({
    message: "User registered",
    data: {
      user: userResponse(user),
    },
  });
};

export const loginUser = async (req, res) => {
  const { email, password } = req.body;

  const user = await AuthService.loginUser(email, password);

  generateJWT(user._id, res);

  res.status(200).json({
    message: "User logged in",
    data: {
      user: userResponse(user),
    },
  });
};

export const logoutUser = (req, res) => {
  res.cookie("jwt", "", {
    maxAge: 0,
    httpOnly: true,
    sameSite: "strict",
    secure: process.env.NODE_ENV === "production",
  });
  res.status(200).json({ message: "User logged out" });
};

export const checkAuthStatus = (req, res) => {
  res.status(200).json({
    message: "User authenticated",
    data: {
      user: userResponse(req.user),
    },
  });
};
