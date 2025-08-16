import bcrypt from "bcryptjs";

import User from "../../models/user.model.js";
import { AuthService } from "./auth.service.js";
import {
  PermissionService,
  UploadService,
  ValidationService,
} from "../infrastructure/index.js";
import { createError, ErrorCodes } from "../../errors.js";

export class UserService {
  static async getAllUsersExcept(userId) {
    return await User.find({ _id: { $ne: userId } })
      .select("-password")
      .lean();
  }

  static async getUserById(userId) {
    ValidationService.validateUserId(userId);
    const user = await User.findById(userId).select("-password").lean();
    if (!user) throw createError(ErrorCodes.USER_NOT_FOUND);
    return user;
  }

  static async updateUserProfile(authUserId, userId, updateData) {
    // "n" stands for "normalised"
    const nName = updateData.fullName?.trim();
    const nEmail = updateData.email?.toLowerCase().trim();
    const nPass = updateData.password?.trim();
    const nPic = updateData.profilePic?.trim();

    ValidationService.validateUserId(userId);
    ValidationService.validateUserUpdate(nName, nEmail, nPass, nPic);

    const user = await PermissionService.getUserIfAuthorised(
      userId,
      authUserId
    );

    if (nName) user.fullName = nName;
    if (nEmail) {
      await AuthService.checkEmailAvailability(nEmail);
      user.email = nEmail;
    }
    if (nPass) user.password = await bcrypt.hash(nPass, 10);
    if (nPic) user.profilePic = await UploadService.uploadProfileImage(nPic);

    return await user.save();
  }

  static async deleteUser(authUserId, userId) {
    ValidationService.validateUserId(userId);

    const user = await PermissionService.getUserIfAuthorised(
      userId,
      authUserId
    );

    await user.deleteOne();
    return user;
  }
}
