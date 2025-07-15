import mongoose from "mongoose";

import { AppError } from "../../utils/appError.js";

const validateFullName = (fullName) => {
  if (!fullName) throw new AppError("Full name is required", 400);
  const len = fullName.trim().length;
  if (len < 3)
    throw new AppError("Full name should be at least 3 characters long", 400);
  if (len > 50)
    throw new AppError("Full name should be less than 50 characters long", 400);
};

const validateEmail = (email) => {
  if (!email) throw new AppError("Email is required", 400);
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) throw new AppError("Invalid email", 400);
};

const validatePassword = (password) => {
  if (!password) throw new AppError("Password is required", 400);
  const len = password.length;
  if (len < 8)
    throw new AppError("Password should be at least 8 characters long", 400);
  if (len > 50)
    throw new AppError("Password should be less than 50 characters long", 400);
};

const validateObjectId = (id, type) => {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new AppError(`Invalid ${type} ID`, 400);
  }
};

export { validateFullName, validateEmail, validatePassword, validateObjectId };
