import bcrypt from "bcryptjs";

import User from "../models/user.model.js";
import { isValidEmail } from "../utils/validation.js";
import { ErrorCodes, createError } from "../errors.js";

export class AuthService {
  static async registerUser(fullName, email, password) {
    // "n" stands for "normalised"
    const nName = fullName?.trim();
    const nEmail = email?.toLowerCase().trim();
    const nPass = password?.trim();

    this.validateRegistrationInput(nName, nEmail, nPass);
    await this.checkEmailAvailability(nEmail);
    const hashedPass = await bcrypt.hash(nPass, 10);

    const user = new User({
      fullName: nName,
      email: nEmail,
      password: hashedPass,
    });

    return await user.save();
  }

  static async loginUser(email, password) {
    const nEmail = email?.trim().toLowerCase();
    const nPass = password?.trim();

    this.validateLoginInput(nEmail, nPass);

    const user = await User.findOne({ email: nEmail });

    if (!user) throw createError(ErrorCodes.AUTH_CREDENTIALS_INVALID);

    const isValidPass = await bcrypt.compare(nPass, user.password);
    if (!isValidPass) throw createError(ErrorCodes.AUTH_CREDENTIALS_INVALID);

    return user;
  }

  static validateRegistrationInput(nName, nEmail, nPass) {
    if (!nName) throw createError(ErrorCodes.USER_FULLNAME_REQUIRED);
    if (!nEmail) throw createError(ErrorCodes.USER_EMAIL_REQUIRED);
    if (!nPass) throw createError(ErrorCodes.USER_PASSWORD_REQUIRED);

    if (nName.length < 3) throw createError(ErrorCodes.USER_FULLNAME_TOO_SHORT);
    if (nName.length > 50) throw createError(ErrorCodes.USER_FULLNAME_TOO_LONG);
    if (!isValidEmail(nEmail)) throw createError(ErrorCodes.USER_EMAIL_INVALID);
    if (nPass.length < 8) throw createError(ErrorCodes.USER_PASSWORD_TOO_SHORT);
  }

  static async checkEmailAvailability(nEmail) {
    const existingUser = await User.findOne({ email: nEmail }).lean();
    if (existingUser) throw createError(ErrorCodes.USER_EMAIL_ALREADY_EXISTS);
  }

  static validateLoginInput(nEmail, nPass) {
    if (!nEmail) throw createError(ErrorCodes.USER_EMAIL_REQUIRED);
    if (!nPass) throw createError(ErrorCodes.USER_PASSWORD_REQUIRED);
    if (!isValidEmail(nEmail)) throw createError(ErrorCodes.USER_EMAIL_INVALID);
    if (nPass.length < 8) throw createError(ErrorCodes.USER_PASSWORD_TOO_SHORT);
  }
}
