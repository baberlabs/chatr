import { createError, ErrorCodes } from "../../errors.js";
import { ValidationService, LIMITS } from "./validation.service.js";
import cloudinary from "../../utils/cloudinary.js";

export class UploadService {
  static async uploadProfileImage(image) {
    ValidationService.validateUserImageFormat(image);
    ValidationService.validateUserImageSize(image);
    try {
      const response = await cloudinary.uploader.upload(image, {
        folder: "profile_pics",
        resource_type: "image",
        max_file_size: LIMITS.imageBytes, // 5MB
      });
      return response.secure_url;
    } catch (error) {
      throw createError(ErrorCodes.USER_UPDATE_IMAGE_FAILED);
    }
  }

  static async uploadMessageImage(image) {
    ValidationService.validateMessageImageFormat(image);
    ValidationService.validateMessageImageSize(image);
    try {
      const response = await cloudinary.uploader.upload(image, {
        folder: "chat_images",
        resource_type: "image",
        max_file_size: LIMITS.imageBytes, // 5MB
      });
      return response.secure_url;
    } catch (error) {
      throw createError(ErrorCodes.MESSAGE_IMAGE_UPLOAD_FAILED);
    }
  }
}
