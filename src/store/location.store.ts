import { create } from "zustand";

export type LocationPoint = {
  address: string;
  latitude: number;
  longitude: number;
};

type LocationState = {
  currentLocation: LocationPoint | null;
  setCurrentLocation: (location: LocationPoint | null) => void;
  clearCurrentLocation: () => void;
};

export const useLocationStore = create<LocationState>((set) => ({
  currentLocation: null,

  setCurrentLocation: (location) =>
    set({ currentLocation: location }),

  clearCurrentLocation: () =>
    set({ currentLocation: null }),
}));