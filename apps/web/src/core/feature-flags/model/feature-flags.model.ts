import { FEATURE_FLAG_NAMES } from './feature-flags.constants';
import type { FeatureFlagName, FeatureFlags, FeatureFlagsSource } from './feature-flags.types';

export const featureFlagsModel = {
  isEnabled: ({ remoteFlags, overrides }: FeatureFlagsSource, name: FeatureFlagName) => {
    return overrides[name] ?? remoteFlags[name];
  },

  isOverridden: ({ overrides }: FeatureFlagsSource, name: FeatureFlagName) => {
    return overrides[name] !== undefined;
  },

  hasOverrides: ({ overrides }: FeatureFlagsSource) => {
    return Object.keys(overrides).length > 0;
  },

  toggleOverride: (source: FeatureFlagsSource, name: FeatureFlagName): Partial<FeatureFlags> => ({
    ...source.overrides,
    [name]: !featureFlagsModel.isEnabled(source, name),
  }),

  getPersistedOverrides: (persisted: unknown): Partial<FeatureFlags> => {
    if (
      typeof persisted !== 'object' ||
      persisted === null ||
      !('overrides' in persisted) ||
      typeof persisted.overrides !== 'object' ||
      persisted.overrides === null
    ) {
      return {};
    }

    const overrides = new Map(Object.entries(persisted.overrides));

    return FEATURE_FLAG_NAMES.reduce<Partial<FeatureFlags>>((result, name) => {
      const value = overrides.get(name);
      return typeof value === 'boolean' ? { ...result, [name]: value } : result;
    }, {});
  },
};
