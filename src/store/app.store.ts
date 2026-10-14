import { create } from "zustand";

interface AppState {
  isInitialized: boolean;
  isOnline: boolean;
  setInitialized: (initialized: boolean) => void;
  setOnline: (online: boolean) => void;
}

export const useAppStore = create<AppState>((set) => ({
  isInitialized: false,
  isOnline: true,
  setInitialized: (initialized) => set({ isInitialized: initialized }),
  setOnline: (online) => set({ isOnline: online }),
}));
