import { create } from "zustand";

import {
  getCurrentUser,
  getStoredToken,
  logout as logoutService,
  User,
} from "@/services/auth/auth.service";

type AuthState = {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;

  setSession: (token: string, user: User) => void;
  restoreSession: () => Promise<void>;
  logout: () => Promise<void>;
};

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  token: null,
  isAuthenticated: false,
  isLoading: true,

  setSession: (token, user) => {
    set({
      token,
      user,
      isAuthenticated: true,
      isLoading: false,
    });
  },

  restoreSession: async () => {
    try {
      set({ isLoading: true });

      const token = await getStoredToken();

      if (!token) {
        set({
          token: null,
          user: null,
          isAuthenticated: false,
          isLoading: false,
        });

        return;
      }

      const user = await getCurrentUser();

      set({
        token,
        user,
        isAuthenticated: true,
        isLoading: false,
      });
    } catch (error) {
      console.log("SESSION RESTORE FAILED:", error);

      await logoutService();

      set({
        token: null,
        user: null,
        isAuthenticated: false,
        isLoading: false,
      });
    }
  },

  logout: async () => {
    try {
      await logoutService();
    } finally {
      set({
        token: null,
        user: null,
        isAuthenticated: false,
        isLoading: false,
      });
    }
  },
}));