import { create } from "zustand";
import { io } from "socket.io-client";

import { api } from "@/lib/api";
import { useChatStore } from "@/store/useChatStore";

const SOCKET_URL =
  import.meta.env.MODE === "development" ? "http://localhost:5001" : "/";

export const useAuthStore = create((set, get) => ({
  authUser: null,
  isCheckingAuth: true,
  isRegistering: false,
  isLoggingIn: false,
  isLoggingOut: false,
  isUpdatingProfile: false,
  socket: null,
  onlineUsers: [],

  // Errors
  isError: false,
  error: null,

  resetErrors: () => {
    set({
      isError: false,
      error: null,
    });
  },

  checkAuth: async () => {
    try {
      const response = await api.get("/auth/status");
      set({ authUser: response.data.user });
      get().connectSocket();
    } catch (error) {
      console.error("Authentication check failed:", error);
      set({ authUser: null });
    } finally {
      set({ isCheckingAuth: false });
    }
  },

  register: async (userData) => {
    set({ isRegistering: true });
    try {
      const response = await api.post("/auth/register", userData);
      set({ authUser: response.data.user });
      get().connectSocket();
    } catch (error) {
      console.error("Registration error:", error);
      set({
        isError: true,
        error: error.response?.data?.message || "Registration failed",
      });
      setTimeout(() => {
        set({
          isError: false,
          error: null,
        });
      }, 10000);
    } finally {
      set({ isRegistering: false });
    }
  },

  login: async (credentials) => {
    set({ isLoggingIn: true });
    get().resetErrors();
    try {
      const response = await api.post("/auth/login", credentials);
      set({ authUser: response.data.user });
      get().connectSocket();
    } catch (error) {
      console.error("Login error:", error);
      set({
        isError: true,
        error: error.response?.data?.message || "Login failed",
      });
      setTimeout(() => {
        set({
          isError: false,
          error: null,
        });
      }, 10000);
    } finally {
      set({ isLoggingIn: false });
    }
  },

  logout: async () => {
    set({ isLoggingOut: true });
    try {
      await api.post("/auth/logout");
      set({ authUser: null });
      const { socket } = get();
      const selectedChatId = useChatStore.getState().selectedChatId;
      if (socket) {
        socket.off("getOnlineUsers");
        socket.off("receiveMessage");
        if (selectedChatId) {
          socket.emit("leaveRoom", `chat-${selectedChatId}`);
        }
      }
      get().disconnectSocket();
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      set({ isLoggingOut: false });
    }
  },

  updateProfile: async (userId, profileData) => {
    set({ isUpdatingProfile: true });
    try {
      const response = await api.put(`/users/${userId}`, profileData);
      set({ authUser: response.data.user });
      return response.data.user;
    } catch (error) {
      console.error("Profile update error:", error);
    } finally {
      set({ isUpdatingProfile: false });
    }
  },

  deleteAccount: async (userId) => {
    try {
      await api.delete(`/users/${userId}`);
      set({ authUser: null });
    } catch (error) {
      console.error("Account deletion error:", error);
    }
  },

  connectSocket: () => {
    const { authUser } = get();
    if (!authUser || get().socket?.connected) return;

    const socket = io(SOCKET_URL, {
      query: { userId: authUser._id },
    });

    socket.connect();
    set({ socket });

    socket.on("getOnlineUsers", (userIds) => {
      const { selectedUser, setGhostTypingIndicatorLength } =
        useChatStore.getState();
      const prevOnlineUsers = get().onlineUsers;
      set({ onlineUsers: userIds });

      const wasUserOnline = prevOnlineUsers.includes(selectedUser?._id);
      const isUserOnline = userIds.includes(selectedUser?._id);

      if (selectedUser && wasUserOnline && !isUserOnline) {
        setGhostTypingIndicatorLength(0);
      }
    });

    socket.on("receiveMessageNotification", ({ message }) => {
      const { chats } = useChatStore.getState();

      const updatedChats = chats
        .map((chat) =>
          chat._id === message.chatId
            ? { ...chat, latestMessage: message }
            : chat
        )
        .sort(
          (a, b) =>
            new Date(b.latestMessage?.createdAt) -
            new Date(a.latestMessage?.createdAt)
        );
      useChatStore.setState({ chats: updatedChats });
    });

    socket.on("receiveMessage", ({ message }) => {
      const chatId = message.chatId;
      const { selectedChatId, chats } = useChatStore.getState();

      if (chatId === selectedChatId) {
        useChatStore.setState((state) => ({
          currentChatMessages: [...state.currentChatMessages, message],
        }));
      }

      const updatedChats = chats
        .map((chat) => {
          return chat._id === chatId
            ? { ...chat, latestMessage: message }
            : chat;
        })
        .sort((a, b) => {
          return (
            new Date(b.latestMessage?.createdAt) -
            new Date(a.latestMessage?.createdAt)
          );
        });

      useChatStore.setState({ chats: updatedChats });
    });

    socket.on("startTypingIndicator", ({ length }) => {
      const { setGhostTypingIndicatorLength } = useChatStore.getState();
      setGhostTypingIndicatorLength(length);
    });

    socket.on("stopTypingIndicator", () => {
      const { setGhostTypingIndicatorLength } = useChatStore.getState();
      setGhostTypingIndicatorLength(0);
    });
  },

  disconnectSocket: () => {
    const { socket } = get();
    if (!socket) return;
    socket.disconnect();
  },
}));
