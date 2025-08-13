/**
 * Errors are caught with catchAsync on the routes
 * themselves, hence, no try-catch is needed here.
 */

import { MessageService } from "../services/message.service.js";
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

  const messages = await MessageService.getMessages(chatId, userId);

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

  const deletedMessage = await MessageService.deleteMessage(messageId, userId);

  res.status(200).json({
    message: "Message deleted",
    data: {
      message: messageResponse(deletedMessage),
    },
  });
};
