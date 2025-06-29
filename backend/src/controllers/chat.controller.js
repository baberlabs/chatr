import mongoose from "mongoose";
import { AppError } from "../utils/appError.js";
import User from "../models/user.model.js";
import Chat from "../models/chat.model.js";

export const getAllChats = async (req, res) => {
  const userId = req.user._id;
  const chats = await Chat.find({ participants: userId }).sort({
    updatedAt: -1,
  });

  return res.status(200).json({
    message: "Chats retrieved successfully",
    data: chats,
  });
};

export const createChat = async (req, res) => {
  const { receiverId } = req.body;
  const senderId = req.user._id;

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
        latestMessage: existingChat.latestMessage,
        createdAt: existingChat.createdAt,
        updatedAt: existingChat.updatedAt,
      },
    });
  }

  const newChat = new Chat({
    isGroup: false,
    participants: [senderId, receiverId],
    chatName: null,
    groupAdmin: null,
    latestMessage: null,
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
      latestMessage: newChat.latestMessage,
      createdAt: newChat.createdAt,
      updatedAt: newChat.updatedAt,
    },
  });
};

export const getChatById = async (req, res) => {
  const { chatId } = req.params;
  const userId = req.user._id;

  if (!mongoose.Types.ObjectId.isValid(chatId)) {
    throw new AppError("Invalid Chat ID", 400);
  }

  const chat = await Chat.findById(chatId);

  if (!chat) {
    throw new AppError("Chat Not Found", 404);
  }

  if (!chat.participants.includes(userId)) {
    throw new AppError("You are not a participant of this chat", 403);
  }

  return res.status(200).json({
    message: "Chat retrieved successfully",
    data: {
      _id: chat._id,
      isGroup: chat.isGroup,
      participants: chat.participants,
      chatName: chat.chatName,
      groupAdmin: chat.groupAdmin,
      latestMessage: chat.latestMessage,
      createdAt: chat.createdAt,
      updatedAt: chat.updatedAt,
    },
  });
};

export const deleteChat = () => {};

export const createGroupChat = () => {};

export const updateGroupChat = () => {};

export const leaveGroupChat = () => {};
