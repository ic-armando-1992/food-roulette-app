import { create } from 'zustand';

type DiscoveryStore = {
  radiusMeters: number;
  setRadiusMeters: (radiusMeters: number) => void;
};

export const useDiscoveryStore = create<DiscoveryStore>((set) => ({
  radiusMeters: 3_000,
  setRadiusMeters: (radiusMeters) => set({ radiusMeters }),
}));
