import { persist } from 'zustand/middleware';

import { IS_DEV_MODE } from '@/shared/config/env/config';
import { createStore } from '@/shared/lib/helpers/create-store';

import { DEFAULT_FEATURE_FLAGS, FEATURE_FLAGS_STORAGE_KEY } from '../model/feature-flags.constants';
import { featureFlagsModel } from '../model/feature-flags.model';
import { featureFlagsService } from '../service/feature-flags.service';
import type { FeatureFlagsStoreSlice } from './feature-flags.store-types';

export const featureFlagsStore = createStore<FeatureFlagsStoreSlice>()(
  persist(
    (set, get) => ({
      remoteFlags: DEFAULT_FEATURE_FLAGS,
      overrides: {},
      actions: {
        fetchFeatureFlags: async () => {
          set({ remoteFlags: await featureFlagsService.getFeatureFlags() });
        },

        toggleOverride: (name) => {
          set({ overrides: featureFlagsModel.toggleOverride(get(), name) });
        },

        resetOverrides: () => set({ overrides: {} }),
      },
    }),
    {
      name: FEATURE_FLAGS_STORAGE_KEY,
      partialize: (state) => ({ overrides: state.overrides }),
      merge: (persisted, current) => ({
        ...current,
        overrides: IS_DEV_MODE ? featureFlagsModel.getPersistedOverrides(persisted) : {},
      }),
    },
  ),
);
