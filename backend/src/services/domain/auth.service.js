import bcrypt from "bcryptjs";

import User from "../../models/user.model.js";
import { ValidationService } from "../infrastructure/index.js";
import { createError as err, ErrorCodes as Code } from "../../errors.js";

export class AuthService {
  static async registerUser(fullName, email, password) {
    // "n" stands for "normalised"
    const nName = fullName?.trim();
    const nEmail = email?.toLowerCase().trim();
    const nPass = password?.trim();

    ValidationService.validateUserRegistration(nName, nEmail, nPass);
    await this.checkEmailAvailability(nEmail);

    const user = new User({
      fullName: nName,
      email: nEmail,
      password: await bcrypt.hash(nPass, 10),
    });

    return await user.save();
  }

  static async loginUser(email, password) {
    const nEmail = email?.trim().toLowerCase();
    const nPass = password?.trim();

    ValidationService.validateUserLogin(nEmail, nPass);

    const user = await User.findOne({ email: nEmail }).lean();
    if (!user) throw err(Code.AUTH_CREDENTIALS_INVALID);

    const isValidPass = await bcrypt.compare(nPass, user.password);
    if (!isValidPass) throw err(Code.AUTH_CREDENTIALS_INVALID);

    return user;
  }

  static async checkEmailAvailability(nEmail) {
    const existingUser = await User.findOne({ email: nEmail }).lean();
    if (existingUser) throw err(Code.USER_EMAIL_ALREADY_EXISTS);
  }
}
