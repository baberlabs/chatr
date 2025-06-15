import mongoose from "mongoose";
import cloudinary from "cloudinary";

import { AppError } from "../utils/appError.js";
import User from "../models/user.model.js";
import Message from "../models/message.model.js";

export const sendMessage = async (req, res) => {
  const { receiverId, text, image } = req.body;
  const senderId = req.user._id;
  const messageData = {};

  if (!receiverId) {
    throw new AppError("Missing User ID", 400);
  }

  if (senderId.toString() === receiverId.toString()) {
    throw new AppError("Cannot send message to yourself", 403);
  }

  if (!text && !image) {
    throw new AppError("Message content is missing", 400);
  }

  if (text) {
    if (text.trim() === "") {
      throw new AppError("Message content is missing", 400);
    }

    if (text.trim().length > 1000) {
      throw new AppError("Text exceeds 1000 characters limit", 400);
    }

    messageData.text = text.trim();
  }

  if (image) {
    if (!/^data:image\/(png|jpeg|jpg);base64,/.test(image.trim())) {
      throw new AppError("Invalid Image Format", 400);
    }

    try {
      const uploadRes = await cloudinary.uploader.upload(image.trim());
      messageData.image = uploadRes.secure_url;
    } catch (error) {
      throw new AppError("Image upload failed");
    }
  }

  if (!mongoose.Types.ObjectId.isValid(receiverId)) {
    throw new AppError("Invalid User ID", 400);
  }

  const user = await User.findById(receiverId);

  if (!user) {
    throw new AppError("User Not Found", 404);
  }

  const newMessage = new Message({
    senderId,
    receiverId,
    ...messageData,
  });

  await newMessage.save();

  res.status(201).json({
    message: "Message sent successfully",
    data: {
      _id: newMessage._id,
      receiverId: newMessage.receiverId,
      senderId: newMessage.senderId,
      text: newMessage.text,
      image: newMessage.image,
      seen: newMessage.seen,
    },
  });
};

export const getMessagesByChatId = () => {};

export const deleteMessage = () => {};
