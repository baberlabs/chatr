import Chat from "../../models/chat.model.js";
import { AppError } from "../../utils/appError.js";
import { chatResponse } from "./response.helpers.js";

const getChatsByUserId = async (userId) => {
  return await Chat.find({ participants: userId }).sort({ updatedAt: -1 });
};

const findChatByChatId = async (chatId) => {
  const chat = await Chat.findById(chatId);
  if (!chat) {
    throw new AppError("Chat Not Found", 404);
  }
  return chat;
};

const verifyUserIsChatParticipant = (chat, userId) => {
  if (!chat.participants.includes(userId)) {
    throw new AppError("You are not a participant of this chat", 403);
  }
};

const ensureChatIdIsPresent = (chatId) => {
  if (!chatId) {
    throw new AppError("Missing Chat ID", 400);
  }
};

const respondWithChats = (res, chats) => {
  if (chats.length === 0) {
    return res.status(200).json({
      message: "No chats found",
      data: [],
    });
  }
  return res.status(200).json({
    message: "Chats retrieved successfully",
    data: chats.map(chatResponse),
  });
};

const findExistingChat = async (senderId, receiverId) => {
  return await Chat.findOne({
    isGroup: false,
    participants: { $all: [senderId, receiverId], $size: 2 },
  });
};

const respondWithChat = (res, chat, message, code) => {
  return res.status(code).json({
    message,
    data: chatResponse(chat),
  });
};

const createNewChat = async (senderId, receiverId) => {
  const newChat = new Chat({
    isGroup: false,
    participants: [senderId, receiverId],
    chatName: null,
    groupAdmin: null,
  });
  await newChat.save();
  return newChat;
};

export {
  getChatsByUserId,
  findChatByChatId,
  verifyUserIsChatParticipant,
  respondWithChats,
  findExistingChat,
  respondWithChat,
  createNewChat,
  ensureChatIdIsPresent,
};
