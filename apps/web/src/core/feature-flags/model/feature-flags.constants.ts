export const FEATURE_FLAG_NAMES = ['theme'] as const;

export const DEFAULT_FEATURE_FLAGS = {
  theme: false,
} satisfies Record<(typeof FEATURE_FLAG_NAMES)[number], boolean>;

export const FEATURE_FLAGS_STORAGE_KEY = 'feature-flags';
