import { create } from "zustand";
import { api } from "../lib/api";

export const useChatStore = create((set, get) => ({
  users: [],
  chats: [],
  currentChatMessages: [],
  isUsersLoading: false,
  isChatsLoading: false,
  isSendingMessage: false,
  selectedUser: null,
  selectedChatId: null,

  setSelectedUser: (user) => {
    if (!user) {
      set({ selectedUser: null, selectedChatId: null });
      return;
    }
    set({ selectedUser: user });
    get().createChat(user._id);
  },
  setSelectedChatId: (chatId) => set({ selectedChatId: chatId }),

  getAllUsers: async () => {
    set({ isUsersLoading: true });
    try {
      const response = await api.get("/users");
      set({ users: response.data.users });
    } catch (error) {
      console.error("Error fetching users:", error);
      set({ users: [] });
    } finally {
      set({ isUsersLoading: false });
    }
  },

  getAllChats: async () => {
    set({ isChatsLoading: true });
    try {
      const response = await api.get("/chats");
      set({ chats: response.data.data });
    } catch (error) {
      console.error("Error fetching chats:", error);
      set({ chats: [] });
    } finally {
      set({ isChatsLoading: false });
    }
  },

  createChat: async (receiverId) => {
    try {
      const response = await api.post("/chats", { receiverId });
      const chatId = response.data.data._id;
      set({ selectedChatId: chatId });
      await get().getChatMessagesById(chatId);
    } catch (error) {
      console.error("Error creating chat:", error);
      return null;
    }
  },

  getChatMessagesById: async (chatId) => {
    try {
      const response = await api.get(`/messages/${chatId}`);
      set({ currentChatMessages: response.data.data });
    } catch (error) {
      console.error("Error fetching chat messages by ID:", error);
      set({ currentChatMessages: [] });
    }
  },

  sendMessage: async (message) => {
    set({ isSendingMessage: true });
    try {
      const response = await api.post(`/messages`, message);
      const newMessage = response.data.data;
      set({ currentChatMessages: [...get().currentChatMessages, newMessage] });
    } catch (error) {
      console.error("Error sending message:", error);
    } finally {
      set({ isSendingMessage: false });
    }
  },
}));
