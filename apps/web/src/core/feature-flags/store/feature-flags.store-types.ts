import type { Simplify } from '@/shared/lib/types/common';

import type { FeatureFlagName, FeatureFlagsSource } from '../model/feature-flags.types';

export type FeatureFlagsStoreSlice = Simplify<FeatureFlagsSource & FeatureFlagsActions>;

export type FeatureFlagsActions = {
  actions: {
    fetchFeatureFlags: () => Promise<void>;
    toggleOverride: (name: FeatureFlagName) => void;
    resetOverrides: () => void;
  };
};
