import { create } from 'zustand';

import { DiscoveryStore } from '@/features/discovery/types/discovery.types';

export const useDiscoveryStore = create<DiscoveryStore>((set) => ({
  radiusMeters: 3_000,
  setRadiusMeters: (radiusMeters) => set({ radiusMeters }),
}));
