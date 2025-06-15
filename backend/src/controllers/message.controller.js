import mongoose from "mongoose";
import cloudinary from "cloudinary";

import { AppError } from "../utils/appError.js";
import User from "../models/user.model.js";
import Message from "../models/message.model.js";
import Chat from "../models/chat.model.js";

export const sendMessage = async (req, res) => {
  const { chatId, text, image } = req.body;
  const senderId = req.user._id;
  const messageData = {};

  if (!chatId) {
    throw new AppError("Missing Chat ID", 400);
  } else {
    if (!mongoose.Types.ObjectId.isValid(chatId)) {
      throw new AppError("Invalid Chat ID", 400);
    }
    const chat = await Chat.findById(chatId);

    if (!chat) {
      throw new AppError("Chat Not Found", 404);
    }

    if (!chat.participants.includes(senderId)) {
      throw new AppError("You are not a participant of this chat", 403);
    }

    messageData.chatId = chatId;
  }

  if (!text && !image) {
    throw new AppError("Message content is missing", 400);
  }

  if (text) {
    if (text.trim() === "" && !image) {
      throw new AppError("Message content is missing", 400);
    }
  }

  if (text) {
    if (text.trim().length > 100) {
      throw new AppError(
        "Message text exceeds maximum length of 1000 characters",
        400
      );
    }
    messageData.text = text.trim();
  }

  if (image) {
    if (!/^data:image\/(png|jpeg|jpg);base64,/.test(image.trim())) {
      throw new AppError("Invalid Image Format", 400);
    }
    try {
      const uploadResult = await cloudinary.uploader.upload(image.trim(), {
        folder: "chat_images",
        resource_type: "image",
      });

      messageData.image = uploadResult.secure_url;
    } catch (error) {
      throw new AppError("Image upload failed", 500);
    }
  }

  const newMessage = new Message({
    ...messageData,
    senderId,
    seen: false,
  });

  await newMessage.save();

  res.status(201).json({
    message: "Message sent successfully",
    data: {
      _id: newMessage._id,
      chatId: newMessage.chatId,
      text: newMessage.text,
      image: newMessage.image,
      senderId: newMessage.senderId,
      seen: newMessage.seen,
    },
  });
};

export const getMessagesByChatId = async (req, res) => {
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
  const messages = await Message.find({ chatId }).sort({ createdAt: 1 });

  res.status(200).json({
    message: "Messages retrieved successfully",
    data: messages.map((msg) => ({
      _id: msg._id,
      chatId: msg.chatId,
      text: msg.text,
      image: msg.image,
      senderId: msg.senderId,
      seen: msg.seen,
      createdAt: msg.createdAt,
    })),
  });
};

export const deleteMessage = async (req, res) => {
  const { messageId } = req.params;
  const userId = req.user._id;
  if (!mongoose.Types.ObjectId.isValid(messageId)) {
    throw new AppError("Invalid Message ID", 400);
  }
  const message = await Message.findById(messageId);

  if (!message) {
    throw new AppError("Message Not Found", 404);
  }
  if (message.senderId.toString() !== userId.toString()) {
    throw new AppError("You can only delete your own messages", 403);
  }
  await Message.deleteOne({ _id: messageId });
  res.status(200).json({
    message: "Message deleted successfully",
    data: {
      _id: messageId,
      chatId: message.chatId,
      text: message.text,
      image: message.image,
      senderId: message.senderId,
      seen: message.seen,
    },
  });
};
