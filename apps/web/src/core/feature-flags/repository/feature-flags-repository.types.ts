import type { ApiResponse, RequestConfig } from '@/shared/api/types';

/** Ответ GET /api/feature-flags. Эндпоинта у бэка пока нет: без него все флаги выключены */
export type FeatureFlagsResponse = Record<string, boolean>;

export type FeatureFlagsRepository = {
  getFeatureFlags(requestConfig?: RequestConfig): ApiResponse<FeatureFlagsResponse>;
};
