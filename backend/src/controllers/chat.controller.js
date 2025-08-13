/**
 * Errors are caught with catchAsync on the routes
 * themselves, hence, no try-catch is needed here.
 */

import { ChatService } from "../services/chat.service.js";
import { chatResponse } from "../utils/responses.js";

export const getAllChats = async (req, res) => {
  const userId = req.user._id;

  const chats = await ChatService.getAllChats(userId);

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

  const chat = await ChatService.createDirectChat(senderId, receiverId);

  res.status(201).json({
    message: "Chat created",
    data: {
      chat: chatResponse(chat),
    },
  });
};

export const getChatById = async (req, res) => {
  const userId = req.user._id;
  const chatId = req.params.chatId;

  const chat = await ChatService.getChatById(chatId, userId);

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
