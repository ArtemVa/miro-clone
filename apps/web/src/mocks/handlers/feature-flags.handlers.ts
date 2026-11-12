import { delay, http, HttpResponse } from 'msw';

import { API_URLS } from '@/shared/api/constants';

import { apiUrl } from '../lib/http';

/** Значения «с бэкенда». В dev их можно переопределить через FeatureFlagsDevtools */
const FEATURE_FLAGS: Record<string, boolean> = {
  theme: true,
};

export const featureFlagsHandlers = [
  http.get(apiUrl(API_URLS.featureFlags.list), async () => {
    await delay();
    return HttpResponse.json(FEATURE_FLAGS);
  }),
];
