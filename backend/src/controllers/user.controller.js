import User from "../models/user.model";

export const getAllUsers = async (req, res) => {
  const currentUserId = req.user._id;

  const users = await User.find({ _id: { $ne: currentUserId } })
    .select("fullName email profilePic isVerified")
    .lean();

  res.status(200).json({ users });
};

export const getUserById = () => {};

export const updateUserProfile = () => {};

export const deleteUser = () => {};

export const getOnlineUsers = () => {};
