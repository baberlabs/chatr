import { create } from "zustand";
import { api } from "../lib/api";
import { useAuthStore } from "./useAuthStore";
import { io } from "socket.io-client";

export const useChatStore = create((set, get) => ({
  users: [],
  chats: [],
  currentChatMessages: [],
  isUsersLoading: false,
  isChatsLoading: false,
  isSendingMessage: false,
  isDeletingMessage: false,
  selectedUser: null,
  selectedChatId: null,
  chatMode: false,

  setChatMode: (mode) => set({ chatMode: mode }),

  setSelectedUser: (user) => {
    const { socket } = useAuthStore.getState();
    const prevChatId = get().selectedChatId;

    if (socket && prevChatId) {
      const prevRoom = `chat-${prevChatId}`;
      socket.emit("leaveRoom", prevRoom);
    }

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
      const roomId = `chat-${chatId}`;
      const { socket } = useAuthStore.getState();
      if (socket) {
        socket.emit("joinRoom", {
          roomId,
          receiverId,
        });
      }
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
      const { socket } = useAuthStore.getState();
      const selectedUser = get().selectedUser;
      if (socket) {
        const roomId = `chat-${get().selectedChatId}`;
        socket.emit("sendMessage", {
          roomId,
          message: newMessage,
          receiverId: selectedUser._id,
        });
      }
    } catch (error) {
      console.error("Error sending message:", error);
    } finally {
      set({ isSendingMessage: false });
    }
  },

  deleteMessage: async (messageId) => {
    set({ isDeletingMessage: true });
    const { currentChatMessages } = get();
    const messageToDelete = currentChatMessages.find(
      (msg) => msg._id === messageId
    );
    if (!messageToDelete) {
      console.error("Message not found:", messageId);
      set({ isDeletingMessage: false });
      return;
    }
    try {
      await api.delete(`/messages/${messageId}`);
      set((state) => ({
        currentChatMessages: state.currentChatMessages.filter(
          (msg) => msg._id !== messageId
        ),
      }));
    } catch (error) {
      console.error("Error deleting message:", error);
    } finally {
      set({ isDeletingMessage: false });
    }
  },
}));
