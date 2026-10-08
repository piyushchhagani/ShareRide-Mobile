import { create } from "zustand";

export type RideLocation = {
  address: string;
  latitude: number;
  longitude: number;
};

type RideState = {
  pickup: RideLocation | null;
  destination: RideLocation | null;

  setPickup: (location: RideLocation) => void;
  setDestination: (location: RideLocation) => void;
  clearLocations: () => void;
};

export const useRideStore = create<RideState>((set) => ({
  pickup: null,
  destination: null,

  setPickup: (location) => set({ pickup: location }),

  setDestination: (location) => set({ destination: location }),

  clearLocations: () =>
    set({
      pickup: null,
      destination: null,
    }),
}));