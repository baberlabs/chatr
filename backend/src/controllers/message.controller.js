/**
 * Errors are caught with catchAsync on the routes
 * themselves, hence, no try-catch is needed here.
 */

import { ChatService } from "../services/domain/chat.service.js";
import { MessageService } from "../services/domain/message.service.js";
import { messageResponse } from "../utils/responses.js";

export const sendMessage = async (req, res) => {
  const chatId = req.body.chatId;
  const senderId = req.user._id;
  const content = ({ text, image } = req.body);
  const newMessage = await MessageService.createMessage(
    chatId,
    senderId,
    content
  );
  await ChatService.updateLatestMessage(chatId);
  res.status(201).json({ message: messageResponse(newMessage) });
};

export const getMessagesByChatId = async (req, res) => {
  const userId = req.user._id;
  const chatId = req.params.chatId;
  const messages = await MessageService.getMessages(chatId, userId);
  res.status(200).json({ messages: messages.map(messageResponse) });
};

export const deleteMessage = async (req, res) => {
  const userId = req.user._id;
  const messageId = req.params.messageId;
  const deletedMessage = await MessageService.deleteMessage(messageId, userId);
  await ChatService.updateLatestMessage(deletedMessage.chatId);
  res.sendStatus(204);
};
