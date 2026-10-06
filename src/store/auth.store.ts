import { create } from "zustand";
import {
  getCurrentUser,
  logout as logoutService,
} from "@/services/auth/auth.service";
import { User } from "@/types/auth";

const normalizeUser = (user: Record<string, any>): User => {
  const fullName =
    user.fullName ??
    user.name ??
    [user.firstName, user.lastName].filter(Boolean).join(" ") ??
    "";

  return {
    ...user,
    fullName,
  } as User;
};

const getStoredToken = async (): Promise<string | null> => {
  try {
    const token = localStorage.getItem("auth_token");
    return token ?? null;
  } catch {
    return null;
  }
};

type AuthState = {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;

  restoreSession: () => Promise<void>;
  setSession: (token: string, user: User) => void;
  logout: () => Promise<void>;
};

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  token: null,
  isLoading: true,
  isAuthenticated: false,

  restoreSession: async () => {
    try {
      const token = await getStoredToken();

      if (!token) {
        set({
          isLoading: false,
          isAuthenticated: false,
        });
        return;
      }

      const user = normalizeUser(await getCurrentUser());

      set({
        token,
        user,
        isLoading: false,
        isAuthenticated: true,
      });
    } catch {
      await logoutService();

      set({
        token: null,
        user: null,
        isLoading: false,
        isAuthenticated: false,
      });
    }
  },

  setSession: (token, user) => {
    set({
      token,
      user,
      isLoading: false,
      isAuthenticated: true,
    });
  },

  logout: async () => {
    await logoutService();

    set({
      token: null,
      user: null,
      isLoading: false,
      isAuthenticated: false,
    });
  },
}));