import { isValidObjectId } from "mongoose";
import { createError as err, ErrorCodes as Code } from "../../errors.js";

const IMG_DATA_URL =
  /^data:image\/(png|jpe?g|webp|gif|bmp|ico|avif)(;charset=[^;]+)?;base64,/i;

// const IMG_DATA_URL =
//   /^data:image\/(png|jpeg|jpg|webp|gif|bmp|x-icon|ico|avif);base64,/;

export const LIMITS = {
  name: { min: 3, max: 50 },
  password: { min: 8 },
  imageBytes: 5 * 1024 * 1024,
  message: { textMax: 1000 },
};

export class ValidationService {
  static validateUserRegistration(fullName, email, password) {
    this.validateFullName(fullName);
    this.validateEmail(email);
    this.validatePassword(password);
  }

  static validateUserUpdate(fullName, email, password, profilePic) {
    if (!fullName && !email && !password && !profilePic) {
      throw err(Code.USER_UPDATE_FIELDS_REQUIRED);
    }
    if (fullName) this.validateFullName(fullName);
    if (email) this.validateEmail(email);
    if (password) this.validatePassword(password);
    if (profilePic) {
      this.validateUserImageFormat(profilePic);
      this.validateUserImageSize(profilePic);
    }
  }

  static validateUserLogin(email, password) {
    this.validateEmail(email);
    this.validatePassword(password);
  }

  static validateChatIds(chatId, userId) {
    this.validateChatId(chatId);
    this.validateUserId(userId);
  }

  static validateChatCreation(senderId, receiverId) {
    this.validateUserId(senderId);
    this.validateUserId(receiverId);
  }

  static validateMessage(text, image) {
    if (!text && !image) throw err(Code.MESSAGE_CONTENT_REQUIRED);
    if (text) this.validateMessageText(text);
    if (image) {
      this.validateMessageImageFormat(image);
      this.validateMessageImageSize(image);
    }
  }

  static validateMessageIds(messageId, userId) {
    this.validateMessageId(messageId);
    this.validateUserId(userId);
  }

  static validateUserId(userId) {
    if (!userId) throw err(Code.USER_ID_REQUIRED);
    if (!isValidObjectId(userId)) throw err(Code.USER_ID_INVALID);
  }

  static validateChatId(chatId) {
    if (!chatId) throw err(Code.CHAT_ID_REQUIRED);
    if (!isValidObjectId(chatId)) throw err(Code.CHAT_ID_INVALID);
  }

  static validateMessageId(messageId) {
    if (!messageId) throw err(Code.MESSAGE_ID_REQUIRED);
    if (!isValidObjectId(messageId)) throw err(Code.MESSAGE_ID_INVALID);
  }

  static validateFullName(name) {
    if (!name) throw err(Code.USER_FULLNAME_REQUIRED);
    if (name?.length < LIMITS.name.min) throw err(Code.USER_FULLNAME_TOO_SHORT);
    if (name?.length > LIMITS.name.max) throw err(Code.USER_FULLNAME_TOO_LONG);
  }

  static validateEmail(email) {
    if (!email) throw err(Code.USER_EMAIL_REQUIRED);
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!regex.test(email)) throw err(Code.USER_EMAIL_INVALID);
  }

  static validatePassword(password) {
    if (!password) throw err(Code.USER_PASSWORD_REQUIRED);
    if (password?.length < LIMITS.password.min)
      throw err(Code.USER_PASSWORD_TOO_SHORT);
  }

  static validateUserImageFormat(image) {
    if (!IMG_DATA_URL.test(image)) throw err(Code.USER_UPDATE_IMAGE_INVALID);
  }

  static validateUserImageSize(image) {
    const base64Size = Buffer.byteLength(image, "base64");
    if (base64Size > LIMITS.imageBytes)
      throw err(Code.USER_UPDATE_IMAGE_TOO_BIG);
  }

  static validateMessageText(text) {
    if (text?.length > LIMITS.message.textMax)
      throw err(Code.MESSAGE_TEXT_TOO_LONG);
  }

  static validateMessageImageFormat(image) {
    if (!IMG_DATA_URL.test(image)) throw err(Code.MESSAGE_IMAGE_INVALID);
  }

  static validateMessageImageSize(image) {
    const base64Size = Buffer.byteLength(image, "base64");
    if (base64Size > LIMITS.imageBytes) throw err(Code.MESSAGE_IMAGE_TOO_BIG);
  }
}
