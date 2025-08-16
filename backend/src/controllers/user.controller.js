import {
  ensureUserIdIsPresent,
  findAllUsers,
  findUserByUserId,
  ensureUserPayloadIsNotEmpty,
  ensureUserIsAuthorisedToUpdateProfile,
  ensureUserIsAuthorisedToDeleteProfile,
  hashPassword,
  ensureEmailNotExists,
  uploadProfilePicToCloudinary,
  updateUserById,
  deleteUserById,
} from "./helpers/user.helpers.js";
import {
  validateEmail,
  validateFullName,
  validateImageFormat,
  validateImageSize,
  validateObjectId,
  validatePassword,
} from "./helpers/validation.helpers.js";
import { userResponse } from "./helpers/response.helpers.js";

export const getAllUsers = async (req, res) => {
  const currentUserId = req.user._id;
  ensureUserIdIsPresent(currentUserId);
  validateObjectId(currentUserId, "User");
  const users = await findAllUsers(currentUserId);
  res.status(200).json({ users: users.map(userResponse) });
};

export const getUserById = async (req, res) => {
  const { id } = req.params;
  ensureUserIdIsPresent(id);
  validateObjectId(id, "User");
  const user = await findUserByUserId(id);
  res.status(200).json({ user: userResponse(user) });
};

export const updateUserProfile = async (req, res) => {
  const targetUserId = req.params.id;
  const currentUserId = req.user._id;
  const fullName = req.body.fullName?.trim();
  const email = req.body.email?.trim().toLowerCase();
  const password = req.body.password?.trim();
  const profilePic = req.body.profilePic?.trim();
  const update = {};
  ensureUserIdIsPresent(targetUserId);
  ensureUserIdIsPresent(currentUserId);
  validateObjectId(targetUserId, "User");
  validateObjectId(currentUserId, "User");
  ensureUserPayloadIsNotEmpty({ fullName, email, password, profilePic });
  await findUserByUserId(targetUserId); // check if user exists
  ensureUserIsAuthorisedToUpdateProfile(currentUserId, targetUserId);
  if (fullName) {
    validateFullName(fullName);
    update.fullName = fullName;
  }
  if (password) {
    validatePassword(password);
    update.password = await hashPassword(password);
  }
  if (email) {
    validateEmail(email);
    await ensureEmailNotExists(email);
    update.email = email;
  }
  if (profilePic) {
    validateImageFormat(profilePic);
    validateImageSize(profilePic);
    update.profilePic = await uploadProfilePicToCloudinary(profilePic);
  }
  const updatedUser = await updateUserById(targetUserId, update);
  res.status(200).json({
    message: "User profile updated successfully",
    user: userResponse(updatedUser),
  });
};

export const deleteUser = async (req, res) => {
  const targetUserId = req.params.id;
  const currentUserId = req.user._id;
  validateObjectId(targetUserId, "User");
  validateObjectId(currentUserId, "User");
  ensureUserIdIsPresent(targetUserId);
  ensureUserIdIsPresent(currentUserId);
  const user = await findUserByUserId(targetUserId); // check that user exists
  ensureUserIsAuthorisedToDeleteProfile(currentUserId, targetUserId);
  await deleteUserById(targetUserId);
  res.status(200).json({
    message: "User account deleted successfully",
    user: userResponse(user),
  });
};
