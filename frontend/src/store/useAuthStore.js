import { create } from "zustand";
import { api } from "../lib/api";
import { io } from "socket.io-client";

const SOCKET_URL =
  import.meta.env.VITE_LOCAL_BACKEND_URL || "http://localhost:5001";

export const useAuthStore = create((set, get) => ({
  authUser: null,
  isCheckingAuth: true,
  isRegistering: false,
  isLoggingIn: false,
  isLoggingOut: false,
  isUpdatingProfile: false,
  socket: null,

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
      set({ user: response.data.user });
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

    const socket = io(SOCKET_URL);
    socket.connect();
    set({ socket });
  },

  disconnectSocket: () => {
    if (!get().socket) return;
    get().socket.disconnect();
  },
}));
