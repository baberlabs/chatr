import {
  ensureChatIdIsPresent,
  findChatByChatId,
  verifyUserIsChatParticipant,
} from "./helpers/chat.helpers.js";
import { ensureUserIdIsPresent } from "./helpers/user.helpers.js";
import {
  validateImageFormat,
  validateImageSize,
  validateObjectId,
  validateText,
} from "./helpers/validation.helpers.js";
import {
  ensureMessagePayloadExists,
  updateChatWithLatestMessage,
  uploadImageToCloudinary,
  createNewMessage,
  findMessagesByChatId,
  findMessageByMessageId,
  ensureMessageIdIsPresent,
  ensureUserIsAuthorisedToDeleteMessage,
  deleteMessageByMessageId,
} from "./helpers/message.helpers.js";
import { messageResponse } from "./helpers/response.helpers.js";

export const sendMessage = async (req, res) => {
  const senderId = req.user._id;
  const chatId = req.body.chatId;
  const text = req.body.text?.trim();
  const image = req.body.image?.trim();
  const messageData = { chatId, senderId };
  ensureChatIdIsPresent(chatId);
  validateObjectId(chatId, "Chat");
  validateObjectId(senderId, "User");
  const chat = await findChatByChatId(chatId);
  verifyUserIsChatParticipant(chat, senderId);
  ensureMessagePayloadExists({ text, image });
  if (text) {
    validateText(text);
    messageData.text = text;
  }
  if (image) {
    validateImageFormat(image);
    validateImageSize(image);
    messageData.image = await uploadImageToCloudinary(image);
  }
  const newMessage = await createNewMessage(messageData);
  await updateChatWithLatestMessage(chatId, newMessage);
  res.status(201).json({
    message: "Message sent successfully",
    data: messageResponse(newMessage),
  });
};

export const getMessagesByChatId = async (req, res) => {
  const { chatId } = req.params;
  const userId = req.user._id;
  ensureChatIdIsPresent(chatId);
  ensureUserIdIsPresent(userId);
  validateObjectId(chatId, "Chat");
  validateObjectId(userId, "User");
  const chat = await findChatByChatId(chatId);
  verifyUserIsChatParticipant(chat, userId);
  const messages = await findMessagesByChatId(chatId);
  res.status(200).json({
    message: "Messages retrieved successfully",
    data: messages.map(messageResponse),
  });
};

export const deleteMessage = async (req, res) => {
  const { messageId } = req.params;
  const userId = req.user._id;
  ensureMessageIdIsPresent(messageId);
  ensureUserIdIsPresent(userId);
  validateObjectId(messageId, "Message");
  const message = await findMessageByMessageId(messageId);
  ensureUserIsAuthorisedToDeleteMessage(message, userId);
  await deleteMessageByMessageId(messageId);
  const chatId = message.chatId;
  const remainingMessages = await findMessagesByChatId(chatId);
  if (remainingMessages.length > 0) {
    const latestMessage = remainingMessages.reduce((latest, current) => {
      return new Date(current.createdAt) > new Date(latest.createdAt)
        ? current
        : latest;
    });
    await updateChatWithLatestMessage(chatId, latestMessage);
  } else {
    await updateChatWithLatestMessage(chatId, null);
  }
  res.status(200).json({
    message: "Message deleted successfully",
    data: messageResponse(message),
  });
};
