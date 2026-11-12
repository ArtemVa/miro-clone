import type { FeatureFlagsResponse } from '../repository/feature-flags-repository.types';
import { DEFAULT_FEATURE_FLAGS, FEATURE_FLAG_NAMES } from './feature-flags.constants';
import type { FeatureFlags } from './feature-flags.types';

export const featureFlagsAdapter = {
  mapFeatureFlags(dto: FeatureFlagsResponse): FeatureFlags {
    if (typeof dto !== 'object' || dto === null) {
      throw new Error('Некорректный ответ feature-flags в featureFlagsAdapter');
    }

    return FEATURE_FLAG_NAMES.reduce<FeatureFlags>((flags, name) => ({ ...flags, [name]: dto[name] === true }), {
      ...DEFAULT_FEATURE_FLAGS,
    });
  },
};
