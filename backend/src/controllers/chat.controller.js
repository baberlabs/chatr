import mongoose from "mongoose";

import Chat from "../models/chat.model.js";
import User from "../models/user.model.js";
import { chatResponse } from "./helpers/response.helpers.js";
import { createError, ErrorCodes } from "../errors.js";

export const getAllChats = async (req, res) => {
  const userId = req.user._id;

  const chats = await Chat.find({ participants: userId })
    .sort({ updatedAt: -1 })
    .lean();

  res.status(200).json({
    message: "Chats retrieved",
    data: {
      chats: chats.map(chatResponse),
    },
  });
};

export const createChat = async (req, res) => {
  const senderId = req.user._id;
  const receiverId = req.body.receiverId;

  if (!receiverId) throw createError(ErrorCodes.USER_ID_REQUIRED);

  if (!mongoose.Types.ObjectId.isValid(receiverId))
    throw createError(ErrorCodes.USER_ID_INVALID);

  const receiver = await User.findById(receiverId).lean();

  if (!receiver) throw createError(ErrorCodes.USER_NOT_FOUND);

  const existingChat = await Chat.findOne({
    isGroup: false,
    participants: { $all: [senderId, receiverId], $size: 2 },
  });

  if (existingChat) throw createError(ErrorCodes.CHAT_ALREADY_EXISTS);

  const newChat = new Chat({
    isGroup: false,
    participants: [senderId, receiverId],
    chatName: null,
    groupAdmin: null,
  });

  await newChat.save();

  res.status(201).json({
    message: "Chat created",
    data: {
      chat: chatResponse(newChat),
    },
  });
};

export const getChatById = async (req, res) => {
  const userId = req.user._id;
  const chatId = req.params.chatId;

  if (!mongoose.Types.ObjectId.isValid(chatId))
    throw createError(ErrorCodes.CHAT_ID_INVALID);

  const chat = await Chat.findById(chatId).lean();

  if (!chat) throw createError(ErrorCodes.CHAT_NOT_FOUND);

  if (!chat.participants.some((participantId) => participantId.equals(userId)))
    throw createError(ErrorCodes.CHAT_ACCESS_DENIED);

  res.status(200).json({
    message: "Chat retrieved",
    data: {
      chat: chatResponse(chat),
    },
  });
};

export const deleteChat = () => {};

export const createGroupChat = () => {};

export const updateGroupChat = () => {};

export const leaveGroupChat = () => {};
