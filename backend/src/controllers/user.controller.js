import mongoose from "mongoose";
import User from "../models/user.model.js";
import { AppError } from "../utils/AppError.js";

export const getAllUsers = async (req, res) => {
  const currentUserId = req.user._id;

  const users = await User.find({ _id: { $ne: currentUserId } })
    .select("fullName email profilePic isVerified")
    .lean();

  res.status(200).json({ users });
};

export const getUserById = async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new AppError("Invalid User ID", 400);
  }

  const user = await User.findById(id).select("-password");

  if (!user) {
    throw new AppError("User Not Found", 404);
  }

  res.status(200).json({ user });
};

export const updateUserProfile = () => {};

export const deleteUser = () => {};
