import { createError as err, ErrorCodes as Code } from "../../errors.js";
import Chat from "../../models/chat.model.js";
import Message from "../../models/message.model.js";
import User from "../../models/user.model.js";

export class PermissionService {
  static async getUserIfAuthorised(userId, authUserId) {
    const user = await User.findById(userId);
    if (!user) throw err(Code.USER_NOT_FOUND);

    const isAuthorised = authUserId.equals(userId);
    if (!isAuthorised) throw err(Code.USER_ACCESS_DENIED);

    return user;
  }

  static async getChatIfAuthorised(userId, chatId) {
    const chat = await Chat.findById(chatId);

    if (!chat) throw err(Code.CHAT_NOT_FOUND);

    const isParticipant = chat.participants.some((id) => id.equals(userId));
    if (!isParticipant) throw err(Code.CHAT_ACCESS_DENIED);

    return chat;
  }

  static async getMessageIfAuthorised(userId, messageId) {
    const message = await Message.findById(messageId);
    if (!message) throw err(Code.MESSAGE_NOT_FOUND);

    const isAuthorised = message.senderId.equals(userId);
    if (!isAuthorised) throw err(Code.MESSAGE_ACCESS_DENIED);

    return message;
  }
}
