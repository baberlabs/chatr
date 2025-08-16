import Message from "../../models/message.model.js";
import {
  ValidationService,
  PermissionService,
  UploadService,
} from "../infrastructure/index.js";

export class MessageService {
  static async createMessage(chatId, senderId, content) {
    const text = content.text?.trim();
    const image = content.image?.trim();
    const msgData = { chatId, senderId };

    ValidationService.validateChatIds(chatId, senderId);
    await PermissionService.getChatIfAuthorised(senderId, chatId);
    ValidationService.validateMessage(text, image);

    if (text) msgData.text = text;
    if (image) msgData.image = await UploadService.uploadMessageImage(image);

    const newMessage = new Message(msgData);
    return await newMessage.save();
  }

  static async getMessages(chatId, userId) {
    ValidationService.validateChatIds(chatId, userId);
    await PermissionService.getChatIfAuthorised(userId, chatId);
    return await Message.find({ chatId }).sort({ createdAt: 1 }).lean();
  }

  static async deleteMessage(messageId, userId) {
    ValidationService.validateMessageIds(messageId, userId);
    const message = await PermissionService.getMessageIfAuthorised(
      userId,
      messageId
    );
    await message.deleteOne();
    return message;
  }
}
