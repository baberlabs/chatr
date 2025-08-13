import bcrypt from "bcryptjs";
import { isValidObjectId } from "mongoose";

import User from "../models/user.model.js";
import { AuthService } from "./auth.service.js";
import cloudinary from "../utils/cloudinary.js";
import {
  isValidEmail,
  isValidImageFormat,
  isValidImageSize,
} from "../utils/validation.js";
import { createError, ErrorCodes } from "../errors.js";

export class UserService {
  static async getAllUsersExcept(userId) {
    return await User.find({ _id: { $ne: userId } })
      .select("-password")
      .lean();
  }

  static async getUserById(userId) {
    if (!userId) throw createError(ErrorCodes.USER_ID_REQUIRED);
    if (!isValidObjectId(userId)) throw createError(ErrorCodes.USER_ID_INVALID);

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

    await this.validateUserId(userId);

    const emptyFields = !nName && !nEmail && !nPass && !nPic;
    if (emptyFields) throw createError(ErrorCodes.USER_UPDATE_FIELDS_REQUIRED);

    const user = await this.findAndValidateUser(userId, authUserId);

    if (nName) await this.updateName(user, nName);
    if (nEmail) await this.updateEmail(user, nEmail);
    if (nPass) await this.updatePassword(user, nPass);
    if (nPic) await this.updateProfilePic(user, nPic);

    return await user.save();
  }

  static async deleteUser(authUserId, userId) {
    await this.validateUserId(userId);
    const user = await this.findAndValidateUser(userId, authUserId);
    await user.deleteOne();
    return user;
  }

  static async validateUserId(id) {
    if (!id) throw createError(ErrorCodes.USER_ID_REQUIRED);
    if (!isValidObjectId(id)) throw createError(ErrorCodes.USER_ID_INVALID);
  }

  static async findAndValidateUser(userId, authUserId) {
    const user = await User.findById(userId);
    if (!user) throw createError(ErrorCodes.USER_NOT_FOUND);
    if (!authUserId.equals(userId))
      throw createError(ErrorCodes.USER_ACCESS_DENIED);
    return user;
  }

  static async updateName(user, nName) {
    if (nName.length < 3) throw createError(ErrorCodes.USER_FULLNAME_TOO_SHORT);
    if (nName.length > 50) throw createError(ErrorCodes.USER_FULLNAME_TOO_LONG);
    user.fullName = nName;
  }

  static async updateEmail(user, nEmail) {
    if (!isValidEmail(nEmail)) throw createError(ErrorCodes.USER_EMAIL_INVALID);
    await AuthService.checkEmailAvailability(nEmail);
    user.email = nEmail;
  }

  static async updatePassword(user, nPass) {
    if (nPass.length < 8) throw createError(ErrorCodes.USER_PASSWORD_TOO_SHORT);
    user.password = await bcrypt.hash(nPass, 10);
  }

  static async updateProfilePic(user, nPic) {
    if (!isValidImageFormat(nPic))
      throw createError(ErrorCodes.USER_UPDATE_IMAGE_INVALID);
    if (!isValidImageSize(nPic))
      throw createError(ErrorCodes.USER_UPDATE_IMAGE_TOO_BIG);
    user.profilePic = await this.uploadImage(nPic);
  }

  static async uploadImage(image) {
    try {
      const response = await cloudinary.uploader.upload(image, {
        folder: "profile_pics",
        resource_type: "image",
        max_file_size: 5 * 1024 * 1024, // 5MB
      });
      return response.secure_url;
    } catch (error) {
      throw createError(ErrorCodes.USER_UPDATE_IMAGE_FAILED);
    }
  }
}
