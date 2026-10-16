
import { create } from "zustand";

import {
  getCurrentUser,
  getStoredToken,
  logout as logoutService,
  User,
} from "@/services/auth/auth.service";
import { setUnauthorizedHandler } from "@/services/api/client";

type AuthState = {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  setSession: (token: string, user: User) => void;
  restoreSession: () => Promise<void>;
  logout: () => Promise<void>;
  expireSession: () => void;
};

let restorePromise: Promise<void> | null = null;

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
    if (restorePromise) {
      return restorePromise;
    }

    restorePromise = (async () => {
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
      } catch {
        try {
          await logoutService();
        } catch {
          // Clear the local session even if logout cleanup fails.
        }

        set({
          token: null,
          user: null,
          isAuthenticated: false,
          isLoading: false,
        });
      } finally {
        restorePromise = null;
      }
    })();

    return restorePromise;
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

  expireSession: () => {
    set({
      token: null,
      user: null,
      isAuthenticated: false,
      isLoading: false,
    });
  },
}));

setUnauthorizedHandler(() => {
  useAuthStore.getState().expireSession();
});
