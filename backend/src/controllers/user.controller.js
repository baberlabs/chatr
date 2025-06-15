import mongoose from "mongoose";
import User from "../models/user.model.js";
import { AppError } from "../utils/appError.js";
import bcrypt from "bcryptjs";

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

export const updateUserProfile = async (req, res) => {
  const { id } = req.params;
  const currentUserId = req.user._id;
  const payload = req.body;
  const { fullName, email, password, profilePic } = payload;
  let update = {};

  if (!mongoose.Types.ObjectId.isValid(id))
    throw new AppError("Invalid User ID", 400);

  if (Object.keys(payload).length === 0)
    throw new AppError("At least one field must be provided", 400);

  const user = await User.findById(id).select("-password");

  if (!user) throw new AppError("User Not Found", 404);

  if (!currentUserId.equals(id)) throw new AppError("Permission Denied", 403);

  if (fullName) {
    const trimmedName = fullName.trim();

    if (trimmedName.length < 3)
      throw new AppError("Full name should be at least 3 characters long", 400);

    if (trimmedName.length > 50)
      throw new AppError(
        "Full name should be less than 50 characters long",
        400
      );

    update.fullName = trimmedName;
  }

  if (password) {
    if (password.length < 8)
      throw new AppError("Password should be at least 8 characters long", 400);

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    update.password = hashedPassword;
  }

  if (email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const trimmedEmail = email.trim().toLowerCase();
    if (!emailRegex.test(trimmedEmail))
      throw new AppError("Invalid email", 400);

    const isEmailRegistered = await User.findOne({
      email: trimmedEmail,
    }).select("-password");
    if (isEmailRegistered) throw new AppError("Email already exists", 409);

    update.email = trimmedEmail;
  }

  if (profilePic) {
    update.profilePic = profilePic.trim();
  }

  async function updateUser(id, update) {
    return await User.findByIdAndUpdate(id, update, {
      new: true,
    }).select("-password");
  }

  const updatedUser = await updateUser(id, update);

  res
    .status(200)
    .json({ message: "User profile updated successfully", user: updatedUser });
};

export const deleteUser = async (req, res) => {
  const { id } = req.params;
  const currentUserId = req.user._id;

  if (!mongoose.Types.ObjectId.isValid(id))
    throw new AppError("Invalid User ID", 400);

  const user = await User.findById(id).select("-password");
  if (!user) throw new AppError("User Not Found", 404);

  if (!currentUserId.equals(id)) throw new AppError("Permission Denied", 403);

  await User.deleteOne({ _id: id });

  res.status(200).json({
    message: "User account deleted successfully",
    user: {
      _id: user._id,
      fullName: user.fullName,
      email: user.email,
      profilePic: user.profilePic,
      isVerified: user.isVerified,
    },
  });
};
