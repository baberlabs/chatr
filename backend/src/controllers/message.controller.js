import mongoose, { isValidObjectId } from "mongoose";

import Chat from "../models/chat.model.js";
import Message from "../models/message.model.js";
import cloudinary from "../utils/cloudinary.js";
import { messageResponse } from "../utils/responses.js";
import { createError, ErrorCodes } from "../errors.js";
import { isValidImageFormat, isValidImageSize } from "../utils/validation.js";

export const sendMessage = async (req, res) => {
  const senderId = req.user._id;
  const chatId = req.body.chatId;
  const text = req.body.text?.trim();
  const image = req.body.image?.trim();
  const messageData = { chatId, senderId };

  if (!chatId) throw createError(ErrorCodes.CHAT_ID_REQUIRED);

  if (!isValidObjectId(chatId)) throw createError(ErrorCodes.CHAT_ID_INVALID);

  const chat = await Chat.findById(chatId);

  if (!chat) throw createError(ErrorCodes.CHAT_NOT_FOUND);

  if (!chat.participants.some((parId) => parId.equals(senderId)))
    throw createError(ErrorCodes.CHAT_ACCESS_DENIED);

  if (!text && !image) throw createError(ErrorCodes.MESSAGE_CONTENT_REQUIRED);

  if (text) {
    if (text.length > 1000)
      throw createError(ErrorCodes.MESSAGE_CONTENT_TOO_LONG);
    messageData.text = text;
  }

  if (image) {
    if (!isValidImageFormat(image))
      throw createError(ErrorCodes.MESSAGE_IMAGE_INVALID);
    if (!isValidImageSize(image))
      throw createError(ErrorCodes.MESSAGE_IMAGE_TOO_BIG);
    try {
      const uploadResult = await cloudinary.uploader.upload(image, {
        folder: "chat_images",
        resource_type: "image",
      });
      messageData.image = uploadResult.secure_url;
    } catch (error) {
      throw createError(ErrorCodes.MESSAGE_UPLOAD_FAILED);
    }
  }

  const newMessage = new Message(messageData);
  await newMessage.save();

  chat.latestMessage = newMessage._id;
  await chat.save();

  res.status(201).json({
    message: "Message sent",
    data: {
      message: messageResponse(newMessage),
    },
  });
};

export const getMessagesByChatId = async (req, res) => {
  const userId = req.user._id;
  const chatId = req.params.chatId;

  if (!chatId) throw createError(ErrorCodes.CHAT_ID_REQUIRED);

  if (!isValidObjectId(chatId)) throw createError(ErrorCodes.CHAT_ID_INVALID);

  const chat = await Chat.findById(chatId).lean();

  if (!chat) throw createError(ErrorCodes.CHAT_NOT_FOUND);

  if (!chat.participants.some((parId) => parId.equals(userId)))
    throw createError(ErrorCodes.CHAT_ACCESS_DENIED);

  const messages = await Message.find({ chatId }).sort({ createdAt: 1 });

  res.status(200).json({
    message: "Messages retrieved",
    data: {
      messages: messages.map(messageResponse),
    },
  });
};

export const deleteMessage = async (req, res) => {
  const userId = req.user._id;
  const messageId = req.params.messageId;

  if (!messageId) throw createError(ErrorCodes.MESSAGE_ID_REQUIRED);

  if (!isValidObjectId(messageId))
    throw createError(ErrorCodes.MESSAGE_ID_INVALID);

  const message = await Message.findById(messageId);

  if (!message) throw createError(ErrorCodes.MESSAGE_NOT_FOUND);

  if (!message.senderId.equals(userId))
    throw createError(ErrorCodes.MESSAGE_ACCESS_DENIED);

  await message.deleteOne();

  const chatId = message.chatId;

  const remainingMessages = await Message.find({ chatId }).sort({
    createdAt: 1,
  });

  let latestMessage = null;

  if (remainingMessages.length) {
    latestMessage = remainingMessages[remainingMessages.length - 1];
  }

  const chat = await Chat.findById(chatId);
  chat.latestMessage = latestMessage ? latestMessage._id : null;
  await chat.save();

  res.status(200).json({
    message: "Message deleted",
    data: {
      message: messageResponse(message),
    },
  });
};
