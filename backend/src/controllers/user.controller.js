// Errors are caught with src/utils/catchAsync.js

import mongoose from "mongoose";
import bcrypt from "bcryptjs";

import User from "../models/user.model.js";
import cloudinary from "../utils/cloudinary.js";
import { userResponse } from "./helpers/response.helpers.js";
import { isValidEmail } from "../utils/helpers.js";
import { createError, ErrorCodes } from "../errors.js";

export const getAllUsers = async (req, res) => {
  const users = await User.find({ _id: { $ne: req.user._id } })
    .select("-password")
    .lean();

  res.status(200).json({
    message: "Users retrieved",
    data: { users: users.map(userResponse) },
  });
};

export const getUserById = async (req, res) => {
  const userId = req.params.id;

  if (!userId) createError(ErrorCodes.USER_ID_REQUIRED);

  if (!mongoose.Types.ObjectId.isValid(userId)) {
    throw createError(ErrorCodes.USER_ID_INVALID);
  }

  const user = await User.findById(userId).select("-password").lean();

  if (!user) throw createError(ErrorCodes.USER_NOT_FOUND);

  res.status(200).json({
    message: "User retrieved",
    data: {
      user: userResponse(user),
    },
  });
};

export const updateUserProfile = async (req, res) => {
  const authUserId = req.user._id;
  const userId = req.params.id;
  const fullName = req.body.fullName?.trim();
  const email = req.body.email?.trim().toLowerCase();
  const password = req.body.password?.trim();
  const profilePic = req.body.profilePic?.trim();

  if (!userId) throw createError(ErrorCodes.USER_ID_REQUIRED);

  if (!mongoose.Types.ObjectId.isValid(userId))
    throw createError(ErrorCodes.USER_ID_INVALID);

  if (!fullName && !email && !password && !profilePic)
    throw createError(ErrorCodes.USER_UPDATE_FIELDS_REQUIRED);

  const user = await User.findById(userId);

  if (!user) throw createError(ErrorCodes.USER_NOT_FOUND);

  if (!authUserId.equals(user._id))
    throw createError(ErrorCodes.USER_ACCESS_DENIED);

  if (fullName) {
    if (fullName.length < 3)
      throw createError(ErrorCodes.USER_FULLNAME_TOO_SHORT);
    if (fullName.length > 50)
      throw createError(ErrorCodes.USER_FULLNAME_TOO_LONG);
    user.fullName = fullName;
  }

  if (password) {
    if (password.length < 8)
      throw createError(ErrorCodes.USER_PASSWORD_TOO_SHORT);
    user.password = await bcrypt.hash(password, 10);
  }

  if (email) {
    if (!isValidEmail(email)) throw createError(ErrorCodes.USER_EMAIL_INVALID);
    const emailExists = await User.findOne({ email }).lean();
    if (emailExists) throw createError(ErrorCodes.USER_EMAIL_ALREADY_EXISTS);
    user.email = email;
  }

  if (profilePic) {
    const regex =
      /^data:image\/(png|jpeg|jpg|webp|gif|bmp|x-icon|ico|avif);base64,/;
    if (!regex.test(profilePic))
      throw createError(ErrorCodes.USER_UPDATE_IMAGE_INVALID);
    const base64Size = Buffer.byteLength(profilePic, "base64");
    const maxSize = 5 * 1024 * 1024; // 5 MB
    if (base64Size > maxSize)
      throw createError(ErrorCodes.USER_UPDATE_IMAGE_TOO_BIG);
    try {
      const uploadResult = await cloudinary.uploader.upload(profilePic, {
        folder: "profile_pics",
        resource_type: "image",
      });
      user.profilePic = uploadResult.secure_url;
    } catch (error) {
      throw createError(ErrorCodes.USER_UPDATE_IMAGE_FAILED, error.message);
    }
  }

  const updatedUser = await user.save();

  res.status(200).json({
    message: "User profile updated",
    data: {
      user: userResponse(updatedUser),
    },
  });
};

export const deleteUser = async (req, res) => {
  const authUserId = req.user._id;
  const userId = req.params.id;

  if (!userId) throw createError(ErrorCodes.USER_ID_REQUIRED);

  if (!mongoose.Types.ObjectId.isValid(userId))
    throw createError(ErrorCodes.USER_ID_INVALID);

  const user = await User.findById(userId);

  if (!user) throw createError(ErrorCodes.USER_NOT_FOUND);

  if (!authUserId.equals(userId))
    throw createError(ErrorCodes.USER_ACCESS_DENIED);

  await user.deleteOne();

  res.status(200).json({
    message: "User account deleted",
    data: {
      user: userResponse(user),
    },
  });
};
