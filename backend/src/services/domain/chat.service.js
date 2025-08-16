import Chat from "../../models/chat.model.js";
import Message from "../../models/message.model.js";
import { UserService } from "./user.service.js";
import {
  ValidationService,
  PermissionService,
} from "../infrastructure/index.js";
import { createError, ErrorCodes } from "../../errors.js";

export class ChatService {
  static async getAllChats(userId) {
    return await Chat.find({ participants: userId })
      .sort({ updatedAt: -1 })
      .lean();
  }

  static async createDirectChat(senderId, receiverId) {
    await UserService.getUserById(receiverId);
    await ValidationService.validateChatCreation(senderId, receiverId);
    await this.guardAgainstDuplicateChat(senderId, receiverId);

    const newChat = new Chat({
      participants: [senderId, receiverId],
    });

    return await newChat.save();
  }

  static async getChatById(chatId, userId) {
    ValidationService.validateChatIds(chatId, userId);
    return await PermissionService.getChatIfAuthorised(userId, chatId);
  }

  static async guardAgainstDuplicateChat(senderId, receiverId) {
    const existingChat = await Chat.findOne({
      isGroup: false,
      participants: { $all: [senderId, receiverId], $size: 2 },
    });
    if (existingChat) throw createError(ErrorCodes.CHAT_ALREADY_EXISTS);
  }

  static async updateLatestMessage(chatId) {
    const messages = await Message.find({ chatId }).sort({ createdAt: -1 });
    const latestMessage = messages[0] || null;

    const chat = await Chat.findById(chatId);
    chat.latestMessage = latestMessage ? latestMessage._id : null;
    await chat.save();
  }
}
