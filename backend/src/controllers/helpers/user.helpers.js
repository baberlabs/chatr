import bcrypt from "bcryptjs";
import { AppError } from "../../utils/appError.js";
import User from "../../models/user.model.js";
import {
  validateFullName,
  validateEmail,
  validatePassword,
} from "./validation.helpers.js";

const findUserByEmail = (email) => User.findOne({ email });

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

export {
  findUserByEmail,
  ensureEmailNotExists,
  verifyCredentials,
  createUser,
  loginWithEmailAndPassword,
  ensureReceiverIdIsPresent,
  verifyUserExists,
};
