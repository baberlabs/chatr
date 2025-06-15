import mongoose from "mongoose";
import { AppError } from "../utils/appError.js";
import User from "../models/user.model.js";
import Chat from "../models/chat.model.js";

export const createChat = async (req, res) => {
  const { receiverId } = req.body;
  const senderId = req.user._id;

  //   console.log("Receiver ID:", typeof receiverId);
  //   console.log("Sender ID", typeof senderId);

  if (!receiverId) {
    throw new AppError("Missing User ID", 400);
  }

  if (!mongoose.Types.ObjectId.isValid(receiverId)) {
    throw new AppError("Invalid User ID", 400);
  }

  const user = await User.findById(receiverId);

  if (!user) {
    throw new AppError("User Not Found", 404);
  }

  const existingChat = await Chat.findOne({
    isGroup: false,
    participants: { $all: [senderId, receiverId], $size: 2 },
  });

  if (existingChat) {
    return res.status(200).json({
      message: "Chat already exists",
      data: {
        _id: existingChat._id,
        isGroup: existingChat.isGroup,
        participants: existingChat.participants,
        chatName: existingChat.chatName,
        groupAdmin: existingChat.groupAdmin,
      },
    });
  }

  const newChat = new Chat({
    isGroup: false,
    participants: [senderId, receiverId],
    chatName: null,
    groupAdmin: null,
  });

  await newChat.save();

  return res.status(201).json({
    message: "Chat created successfully",
    data: {
      _id: newChat._id,
      isGroup: newChat.isGroup,
      participants: newChat.participants,
      chatName: newChat.chatName,
      groupAdmin: newChat.groupAdmin,
    },
  });
};

export const getChatById = () => {};

export const deleteChat = () => {};

export const createGroupChat = () => {};

export const updateGroupChat = () => {};

export const leaveGroupChat = () => {};
