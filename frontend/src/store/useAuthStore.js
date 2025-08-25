import { create } from "zustand";
import { io } from "socket.io-client";

import { api } from "@/lib/api";
import { useChatStore } from "@/store/useChatStore";

const devMode = import.meta.env.MODE === "development";
const SOCKET_URL = devMode ? "http://localhost:5001" : "/";
const LOCAL_AUTH_USER = devMode ? "chatr-dev-authUser" : "chatr-prod-authUser";

export const useAuthStore = create((set, get) => ({
  authUser: null,
  isCheckingAuth: true,
  isRegistering: false,
  isLoggingOut: false,
  isUpdatingProfile: false,
  socket: null,
  onlineUsers: [],
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
      const storedUser = localStorage.getItem(LOCAL_AUTH_USER);

      if (storedUser) {
        set({ authUser: JSON.parse(storedUser) });
        get().connectSocket();

        try {
          await api.get("/auth/status");
        } catch (error) {
          set({ authUser: null });
          localStorage.removeItem(LOCAL_AUTH_USER);
          get().disconnectSocket();
        }

        return;
      }

      set({ authUser: null });
    } catch (error) {
      console.error("Auth check failed:", error);
      set({ authUser: null });
      localStorage.removeItem(LOCAL_AUTH_USER);
    } finally {
      set({ isCheckingAuth: false });
    }
  },

  register: async (userData) => {
    set({ isRegistering: true });
    try {
      const response = await api.post("/auth/register", userData);
      const user = response.data.user;
      localStorage.setItem(LOCAL_AUTH_USER, JSON.stringify(user));
      set({ authUser: user });
      get().connectSocket();
    } catch (error) {
      console.error("Registration error:", error);
      set({
        isError: true,
        error: error.response?.data?.message || "Registration failed",
        authUser: null,
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
    get().resetErrors();
    try {
      const response = await api.post("/auth/login", credentials);
      const user = response.data.user;
      localStorage.setItem(LOCAL_AUTH_USER, JSON.stringify(user));
      set({ authUser: user });
      get().connectSocket();
    } catch (error) {
      console.error("Login error:", error);
      set({
        isError: true,
        error: error.response?.data?.message || "Login failed",
        authUser: null,
      });
      setTimeout(() => {
        set({
          isError: false,
          error: null,
        });
      }, 10000);
    }
  },

  logout: async () => {
    set({ isLoggingOut: true });
    try {
      await api.post("/auth/logout");
      set({ authUser: null });
      localStorage.removeItem(LOCAL_AUTH_USER);
      const { socket } = get();
      const selectedChatId = useChatStore.getState().selectedChatId;
      if (socket) {
        socket.off("users:online");
        socket.off("message:received");
        if (selectedChatId) {
          socket.emit("chat:leave", `chat-${selectedChatId}`);
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
      const user = response.data.user;
      set({ authUser: user });
      localStorage.setItem(LOCAL_AUTH_USER, JSON.stringify(user));
      return response.data.user;
    } catch (error) {
      set({
        error: error.response?.data?.message || "Profile update failed",
      });
      setTimeout(() => {
        set({ error: null });
      }, 5000);
      console.error("Profile update error:", error);
      throw error;
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

    socket.on("users:online", (userIds) => {
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

    socket.on("message:notification", ({ message }) => {
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

    socket.on("message:received", ({ message }) => {
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

    socket.on("typing:started", ({ length }) => {
      const { setGhostTypingIndicatorLength } = useChatStore.getState();
      setGhostTypingIndicatorLength(length);
    });

    socket.on("typing:stopped", () => {
      const { setGhostTypingIndicatorLength } = useChatStore.getState();
      setGhostTypingIndicatorLength(0);
    });

    socket.on("message:deleted", ({ messageId }) => {
      if (!messageId) return;

      useChatStore.setState((state) => ({
        currentChatMessages: state.currentChatMessages.filter(
          (msg) => msg._id !== messageId
        ),
      }));

      useChatStore.getState().getAllChats();
    });
  },

  disconnectSocket: () => {
    const { socket } = get();
    if (!socket) return;
    socket.disconnect();
  },
}));
