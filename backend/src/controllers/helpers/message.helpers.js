import cloudinary from "../../utils/cloudinary.js";
import { AppError } from "../../utils/appError.js";
import Message from "../../models/message.model.js";
import Chat from "../../models/chat.model.js";

const ensureMessageIdIsPresent = (messageId) => {
  if (!messageId) {
    throw new AppError("Missing Message ID", 400);
  }
};

const ensureMessagePayloadExists = ({ text, image }) => {
  const isTextEmpty = !text || text === "";
  const isImageEmpty = !image || image === "";
  if (isTextEmpty && isImageEmpty) {
    throw new AppError("Message content is missing", 400);
  }
};

const uploadImageToCloudinary = async (image) => {
  try {
    const uploadResult = await cloudinary.uploader.upload(image, {
      folder: "chat_images",
      resource_type: "image",
    });
    return uploadResult.secure_url;
  } catch (error) {
    throw new AppError("Image upload failed", 500);
  }
};

const createNewMessage = async (messageData) => {
  const newMessage = new Message(messageData);
  //   return await newMessage.save();
  await newMessage.save();
  return newMessage;
};

const updateChatWithLatestMessage = async (chatId, latestMessage) => {
  await Chat.findByIdAndUpdate(chatId, { latestMessage });
};

const findMessagesByChatId = async (chatId) => {
  return await Message.find({ chatId }).sort({ createdAt: 1 });
};

const findMessageByMessageId = async (messageId) => {
  const message = await Message.findById(messageId);
  if (!message) {
    throw new AppError("Message Not Found", 404);
  }
  return message;
};

const ensureUserIsAuthorisedToDeleteMessage = (message, userId) => {
  if (message.senderId.toString() !== userId.toString()) {
    throw new AppError("You can only delete your own messages", 403);
  }
};

const deleteMessageByMessageId = async (messageId) => {
  await Message.deleteOne({ _id: messageId });
};

export {
  ensureMessagePayloadExists,
  uploadImageToCloudinary,
  createNewMessage,
  updateChatWithLatestMessage,
  findMessagesByChatId,
  findMessageByMessageId,
  ensureMessageIdIsPresent,
  ensureUserIsAuthorisedToDeleteMessage,
  deleteMessageByMessageId,
};
