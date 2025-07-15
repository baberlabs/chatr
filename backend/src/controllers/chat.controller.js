import { validateObjectId } from "./helpers/validation.helpers.js";
import {
  getChatsByUserId,
  findChatByChatId,
  verifyUserIsChatParticipant,
  respondWithChats,
  findExistingChat,
  respondWithChat,
  createNewChat,
} from "./helpers/chat.helpers.js";
import {
  ensureReceiverIdIsPresent,
  verifyUserExists,
} from "./helpers/user.helpers.js";

export const getAllChats = async (req, res) => {
  const userId = req.user._id;
  validateObjectId(userId, "User");
  const chats = await getChatsByUserId(userId);
  respondWithChats(res, chats);
};

export const createChat = async (req, res) => {
  const { receiverId } = req.body;
  const senderId = req.user._id;
  ensureReceiverIdIsPresent(receiverId);
  validateObjectId(senderId, "User");
  validateObjectId(receiverId, "User");
  await verifyUserExists(receiverId);
  const existingChat = await findExistingChat(senderId, receiverId);
  if (existingChat) {
    respondWithChat(res, existingChat, "Chat already exists", 200);
  }
  const newChat = await createNewChat(senderId, receiverId);
  await respondWithChat(res, newChat, "Chat created successfully", 201);
};

export const getChatById = async (req, res) => {
  const { chatId } = req.params;
  const userId = req.user._id;
  validateObjectId(userId, "User");
  validateObjectId(chatId, "Chat");
  const chat = await findChatByChatId(chatId);
  verifyUserIsChatParticipant(chat, userId);
  respondWithChat(res, chat, "Chat retrieved successfully", 200);
};

export const deleteChat = () => {};

export const createGroupChat = () => {};

export const updateGroupChat = () => {};

export const leaveGroupChat = () => {};
