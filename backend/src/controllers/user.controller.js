/**
 * Errors are caught with catchAsync on the routes
 * themselves, hence, no try-catch is needed here.
 */

import { UserService } from "../services/domain/user.service.js";
import { userResponse } from "../utils/responses.js";

export const getAllUsers = async (req, res) => {
  const userId = req.user._id;
  const users = await UserService.getAllUsersExcept(userId);
  res.status(200).json({ users: users.map(userResponse) });
};

export const getUserById = async (req, res) => {
  const userId = req.params.id;
  const user = await UserService.getUserById(userId);
  res.status(200).json({ user: userResponse(user) });
};

export const updateUserProfile = async (req, res) => {
  const authUserId = req.user._id;
  const userId = req.params.id;
  const updateData = ({ fullName, email, password, profilePic } = req.body);
  const updatedUser = await UserService.updateUserProfile(
    authUserId,
    userId,
    updateData
  );
  res.status(200).json({ user: userResponse(updatedUser) });
};

export const deleteUser = async (req, res) => {
  const authUserId = req.user._id;
  const userId = req.params.id;
  await UserService.deleteUser(authUserId, userId);
  res.sendStatus(204);
};
