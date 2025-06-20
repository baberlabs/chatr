import { create } from "zustand";
import { api } from "../lib/api";
import { io } from "socket.io-client";
import { useChatStore } from "./useChatStore";

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
    } finally {
      set({ isRegistering: false });
    }
  },

  login: async (credentials) => {
    set({ isLoggingIn: true });
    try {
      const response = await api.post("/auth/login", credentials);
      set({ authUser: response.data.user });
      get().connectSocket();
    } catch (error) {
      console.error("Login error:", error);
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
      set({ onlineUsers: userIds });
    });

    socket.on("receiveMessage", (data) => {
      if (data.message.chatId !== useChatStore.getState().selectedChatId) {
        alert("New message received in another chat");
      } else {
        useChatStore.setState((state) => ({
          currentChatMessages: [...state.currentChatMessages, data.message],
        }));
      }
    });
  },

  disconnectSocket: () => {
    const { socket } = get();
    if (!socket) return;
    socket.disconnect();
  },
}));
