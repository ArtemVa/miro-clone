import { featureFlagsModel } from '../model/feature-flags.model';
import type { FeatureFlagName } from '../model/feature-flags.types';
import type { FeatureFlagsStoreSlice } from './feature-flags.store-types';

export const featureFlagsStoreSelectors = {
  isEnabled: (name: FeatureFlagName) => (state: FeatureFlagsStoreSlice) => featureFlagsModel.isEnabled(state, name),
  remoteFlags: (state: FeatureFlagsStoreSlice) => state.remoteFlags,
  overrides: (state: FeatureFlagsStoreSlice) => state.overrides,
  featureFlags: (state: FeatureFlagsStoreSlice) => ({
    remoteFlags: state.remoteFlags,
    overrides: state.overrides,
  }),
  actions: (state: FeatureFlagsStoreSlice) => state.actions,
};
