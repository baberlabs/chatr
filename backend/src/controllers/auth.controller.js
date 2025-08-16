import { generateJWT } from "../utils/generateJWT.js";
import {
  createUser,
  loginWithEmailAndPassword,
} from "./helpers/user.helpers.js";
import { userResponse } from "./helpers/response.helpers.js";

export const registerUser = async (req, res) => {
  let { fullName, email, password } = req.body;
  fullName = fullName?.trim();
  email = email?.trim().toLowerCase();
  password = password?.trim();

  const user = await createUser(fullName, email, password);
  generateJWT(user._id, res);
  res.status(201).json({
    message: "User registered successfully",
    user: userResponse(user),
  });
};

export const loginUser = async (req, res) => {
  let { email, password } = req.body;
  email = email?.trim().toLowerCase();
  password = password?.trim();

  const user = await loginWithEmailAndPassword(email, password);
  generateJWT(user._id, res);
  res.status(200).json({
    message: "User logged in successfully",
    user: userResponse(user),
  });
};

export const logoutUser = (req, res) => {
  res.cookie("jwt", "", {
    maxAge: 0,
    httpOnly: true,
    sameSite: "strict",
    secure: process.env.NODE_ENV === "production",
  });
  res.status(200).json({ message: "User logged out successfully" });
};

export const checkAuthStatus = (req, res) => {
  res.status(200).json({
    message: "Authorised - Valid Token",
    user: req.user,
  });
};
