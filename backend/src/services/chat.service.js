import { isValidObjectId } from "mongoose";

import User from "../models/user.model.js";
import Chat from "../models/chat.model.js";
import { createError, ErrorCodes } from "../errors.js";

export class ChatService {
  static async getAllChats(userId) {
    return await Chat.find({ participants: userId })
      .sort({ updatedAt: -1 })
      .lean();
  }

  static async createDirectChat(senderId, receiverId) {
    await this.validateReceiver(receiverId);
    await this.guardAgainstDuplicateChat(senderId, receiverId);

    const newChat = new Chat({
      participants: [senderId, receiverId],
    });

    return await newChat.save();
  }

  static async getChatById(chatId, userId) {
    if (!isValidObjectId(chatId)) throw createError(ErrorCodes.CHAT_ID_INVALID);

    const chat = await Chat.findById(chatId).lean();
    if (!chat) throw createError(ErrorCodes.CHAT_NOT_FOUND);

    const isParticipant = chat.participants.some((id) => id.equals(userId));
    if (!isParticipant) throw createError(ErrorCodes.CHAT_ACCESS_DENIED);

    return chat;
  }

  static async validateReceiver(id) {
    if (!id) throw createError(ErrorCodes.USER_ID_REQUIRED);
    if (!isValidObjectId(id)) throw createError(ErrorCodes.USER_ID_INVALID);
    const receiver = await User.findById(id).lean();
    if (!receiver) throw createError(ErrorCodes.USER_NOT_FOUND);
  }

  static async guardAgainstDuplicateChat(senderId, receiverId) {
    const existingChat = await Chat.findOne({
      isGroup: false,
      participants: { $all: [senderId, receiverId], $size: 2 },
    });
    if (existingChat) throw createError(ErrorCodes.CHAT_ALREADY_EXISTS);
  }
}
