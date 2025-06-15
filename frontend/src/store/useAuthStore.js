import { create } from "zustand";
import { api } from "../lib/api";

export const useAuthStore = create((set) => ({
  isRegistering: false,
  isLoggingIn: false,
  isCheckingAuth: true,
  authUser: null,

  checkAuth: async () => {
    try {
      const response = await api.get("/auth/status");
      set({ authUser: response.data.user });
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
    } catch (error) {
      console.error("Login error:", error);
    } finally {
      set({ isLoggingIn: false });
    }
  },
}));
