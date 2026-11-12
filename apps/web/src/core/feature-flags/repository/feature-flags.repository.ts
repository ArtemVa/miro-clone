import { API_URLS } from '@/shared/api/constants';
import { httpClient } from '@/shared/api/http-client';

import type { FeatureFlagsRepository, FeatureFlagsResponse } from './feature-flags-repository.types';

export const featureFlagsRepository: FeatureFlagsRepository = {
  getFeatureFlags(requestConfig) {
    return httpClient.get<FeatureFlagsResponse>(API_URLS.featureFlags.list, requestConfig?.config);
  },
};
