import { create } from "zustand";
import { api } from "../lib/api";

export const useChatStore = create((set, get) => ({
  users: [],
  chats: [],
  currentChatMessages: [],
  isUsersLoading: false,
  isChatsLoading: false,
  isSendingMessage: false,

  getAllUsers: async () => {
    set({ isUsersLoading: true });
    try {
      const response = await api.get("/users");
      set({ users: response.data.users });
      return response.data.users;
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
      return response.data.data;
    } catch (error) {
      console.error("Error fetching chats:", error);
      return [];
    } finally {
      set({ isChatsLoading: false });
    }
  },

  getChatMessagesById: async (chatId) => {
    try {
      const response = await api.get(`/messages/${chatId}`);
      set({ currentChatMessages: response.data.data });
      return response.data.data;
    } catch (error) {
      console.error("Error fetching chat messages by ID:", error);
      set({ currentChatMessages: [] });
    }
  },

  createChat: async (receiverId) => {
    try {
      const response = await api.post("/chats", { receiverId });
      console.log("Chat created:", response.data);
      const newChat = response.data.data;
      return newChat;
    } catch (error) {
      console.error("Error creating chat:", error);
      return null;
    }
  },

  sendMessage: async (message) => {
    set({ isSendingMessage: true });
    try {
      const response = await api.post(`/messages`, message);
      console.log("Message sent:", response.data);
      const newMessage = response.data.data;
      console.log("New message:", newMessage);
      const updatedMessages = [...get().currentChatMessages, newMessage];
      set({ currentChatMessages: updatedMessages });
      return newMessage;
    } catch (error) {
      console.error("Error sending message:", error);
      return null;
    } finally {
      set({ isSendingMessage: false });
    }
  },
}));
