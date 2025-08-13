import { isValidObjectId } from "mongoose";

import Chat from "../models/chat.model.js";
import Message from "../models/message.model.js";
import cloudinary from "../utils/cloudinary.js";
import { isValidImageFormat, isValidImageSize } from "../utils/validation.js";
import { createError, ErrorCodes } from "../errors.js";

export class MessageService {
  static async createMessage(chatId, senderId, content) {
    const text = content.text?.trim();
    const image = content.image?.trim();
    const messageData = { chatId, senderId };

    const chat = await this.findAndValidateChat(chatId, senderId);

    const isEmptyContent = !text && !image;
    if (isEmptyContent) throw createError(ErrorCodes.MESSAGE_CONTENT_REQUIRED);

    if (text) {
      await this.validateText(text);
      messageData.text = text;
    }

    if (image) {
      await this.validateImage(image);
      const imageUrl = await this.uploadImage(image);
      messageData.image = imageUrl;
    }

    const newMessage = new Message(messageData);
    await newMessage.save();

    chat.latestMessage = newMessage._id;
    await chat.save();

    return newMessage;
  }

  static async getMessages(chatId, userId) {
    await this.findAndValidateChat(chatId, userId);
    return await Message.find({ chatId }).sort({ createdAt: 1 }).lean();
  }

  static async deleteMessage(messageId, userId) {
    const message = await this.findAndValidateMessage(messageId, userId);
    await message.deleteOne();

    await this.updateChatLatestMessage(message.chatId);
    return message;
  }

  static async findAndValidateChat(chatId, senderId) {
    if (!chatId) throw createError(ErrorCodes.CHAT_ID_REQUIRED);
    if (!isValidObjectId(chatId)) throw createError(ErrorCodes.CHAT_ID_INVALID);

    const chat = await Chat.findById(chatId);
    if (!chat) throw createError(ErrorCodes.CHAT_NOT_FOUND);

    const isParticipant = chat.participants.some((id) => id.equals(senderId));
    if (!isParticipant) throw createError(ErrorCodes.CHAT_ACCESS_DENIED);

    return chat;
  }

  static async findAndValidateMessage(id, userId) {
    if (!id) throw createError(ErrorCodes.MESSAGE_ID_REQUIRED);
    if (!isValidObjectId(id)) throw createError(ErrorCodes.MESSAGE_ID_INVALID);

    const message = await Message.findById(id);
    if (!message) throw createError(ErrorCodes.MESSAGE_NOT_FOUND);
    if (!message.senderId.equals(userId))
      throw createError(ErrorCodes.MESSAGE_ACCESS_DENIED);

    return message;
  }

  static async validateText(text) {
    if (text.length > 1000) throw createError(ErrorCodes.MESSAGE_TEXT_TOO_LONG);
  }

  static async validateImage(image) {
    if (!isValidImageFormat(image))
      throw createError(ErrorCodes.MESSAGE_IMAGE_INVALID);
    if (!isValidImageSize(image))
      throw createError(ErrorCodes.MESSAGE_IMAGE_TOO_BIG);
  }

  static async uploadImage(image) {
    try {
      const result = await cloudinary.uploader.upload(image, {
        folder: "chat_images",
        resource_type: "image",
      });
      return result.secure_url;
    } catch (error) {
      throw createError(ErrorCodes.MESSAGE_IMAGE_UPLOAD_FAILED);
    }
  }

  static async updateChatLatestMessage(chatId) {
    const messages = await Message.find({ chatId }).sort({ createdAt: -1 });
    const latestMessage = messages[0] || null;

    const chat = await Chat.findById(chatId);
    chat.latestMessage = latestMessage ? latestMessage._id : null;
    await chat.save();
  }
}
