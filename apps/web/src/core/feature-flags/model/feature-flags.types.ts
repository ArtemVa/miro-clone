import type { FEATURE_FLAG_NAMES } from './feature-flags.constants';

/* ----- MODEL FOR FRONTEND ----- */

/**
 * remoteFlags — значения с бэкенда (источник правды),
 * overrides — ручные переключения из devtools (только dev, хранятся в localStorage)
 */
export type FeatureFlagsSource = {
  remoteFlags: FeatureFlags;
  overrides: Partial<FeatureFlags>;
};

export type FeatureFlags = Record<FeatureFlagName, boolean>;

export type FeatureFlagName = (typeof FEATURE_FLAG_NAMES)[number];

/* ----- UI TYPES ----- */
