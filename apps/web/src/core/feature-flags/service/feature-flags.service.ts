import { featureFlagsAdapter } from '../model/feature-flags.adapter';
import type { FeatureFlags } from '../model/feature-flags.types';
import { featureFlagsRepository } from '../repository/feature-flags.repository';

export const featureFlagsService = {
  async getFeatureFlags(): Promise<FeatureFlags> {
    const { data } = await featureFlagsRepository.getFeatureFlags();
    return featureFlagsAdapter.mapFeatureFlags(data);
  },
};
