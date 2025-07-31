import bcrypt from "bcryptjs";
import cloudinary from "../../utils/cloudinary.js";

import { AppError } from "../../utils/appError.js";
import User from "../../models/user.model.js";
import {
  validateFullName,
  validateEmail,
  validatePassword,
} from "./validation.helpers.js";

const ensureUserIdIsPresent = (userId) => {
  if (!userId) {
    throw new AppError("Missing User ID", 400);
  }
};

const findUserByEmail = (email) => User.findOne({ email });

const findAllUsers = async (currentUserId) => {
  return await User.find({ _id: { $ne: currentUserId } })
    .select("fullName email profilePic isVerified createdAt updatedAt")
    .lean();
};

const findUserByUserId = async (userId) => {
  const user = await User.findById(userId).select("-password");
  if (!user) {
    throw new AppError("User Not Found", 404);
  }
  return user;
};

const ensureEmailNotExists = async (email) => {
  if (await findUserByEmail(email))
    throw new AppError("Email already exists", 409);
};

const verifyCredentials = async (email, password) => {
  const user = await findUserByEmail(email);
  if (!user || !(await bcrypt.compare(password, user.password))) {
    throw new AppError("Invalid credentials", 401);
  }
  return user;
};

const createUser = async (fullName, email, password) => {
  validateFullName(fullName);
  validateEmail(email);
  validatePassword(password);
  await ensureEmailNotExists(email);

  const hashedPassword = await bcrypt.hash(password, 10);

  const user = new User({
    fullName: fullName.trim(),
    email,
    password: hashedPassword,
  });

  await user.save();
  return user;
};

const loginWithEmailAndPassword = async (email, password) => {
  validateEmail(email);
  validatePassword(password);
  return verifyCredentials(email, password);
};

const ensureReceiverIdIsPresent = (receiverId) => {
  if (!receiverId) {
    throw new AppError("Missing User ID", 400);
  }
};

const verifyUserExists = async (userId) => {
  const user = await User.findById(userId);
  if (!user) {
    throw new AppError("User Not Found", 404);
  }
};

const ensureUserPayloadIsNotEmpty = ({
  fullName,
  email,
  password,
  profilePic,
}) => {
  if (!fullName && !email && !password && !profilePic) {
    throw new AppError("At least one field must be provided", 400);
  }
};

const ensureUserIsAuthorisedToUpdateProfile = (currentUserId, targetUserId) => {
  if (!currentUserId.equals(targetUserId)) {
    throw new AppError("Permission Denied", 403);
  }
};

const ensureUserIsAuthorisedToDeleteProfile = (currentUserId, targetUserId) => {
  if (!currentUserId.equals(targetUserId)) {
    throw new AppError("Permission Denied", 403);
  }
};

const hashPassword = async (password) => {
  const salt = await bcrypt.genSalt(10);
  return await bcrypt.hash(password, salt);
};

const uploadProfilePicToCloudinary = async (profilePic) => {
  try {
    const uploadResult = await cloudinary.uploader.upload(profilePic, {
      folder: "profile_pics",
      resource_type: "image",
    });
    return uploadResult.secure_url;
  } catch (error) {
    throw new AppError("Profile picture upload failed", 500);
  }
};

const updateUserById = async (userId, update) => {
  return await User.findByIdAndUpdate(userId, update, {
    new: true,
  }).select("-password");
};

const deleteUserById = async (userId) => {
  await User.deleteOne({ _id: userId });
};

export {
  findUserByEmail,
  ensureEmailNotExists,
  verifyCredentials,
  createUser,
  loginWithEmailAndPassword,
  ensureReceiverIdIsPresent,
  verifyUserExists,
  ensureUserIdIsPresent,
  findAllUsers,
  findUserByUserId,
  ensureUserPayloadIsNotEmpty,
  ensureUserIsAuthorisedToUpdateProfile,
  ensureUserIsAuthorisedToDeleteProfile,
  hashPassword,
  uploadProfilePicToCloudinary,
  updateUserById,
  deleteUserById,
};
