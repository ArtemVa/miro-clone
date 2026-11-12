import { isAxiosError } from 'axios';

import { getApiErrorStatus, httpClient } from '@/shared/api/http-client';

import { authModel } from '../model/auth.model';
import { authStore } from '../store/auth.store';

declare module 'axios' {
  interface AxiosRequestConfig {
    skipAuthRefresh?: boolean;
    _retry?: boolean;
  }
}

let refreshPromise: Promise<string> | null = null;

/** Один refresh на все запросы, которые получили 401 одновременно: остальные ждут его результат */
const refreshOnce = () => {
  refreshPromise ??= authStore
    .getState()
    .actions.refreshToken()
    .finally(() => {
      refreshPromise = null;
    });

  return refreshPromise;
};

/**
 * Cookie с refresh-токеном у вкладок общие. Если соседняя вкладка обновила токены раньше нас,
 * наш refresh получит 401, а свежий access-токен она уже положила в localStorage
 */
const getTokenFromOtherTab = async (failedToken: string | undefined) => {
  await authStore.persist.rehydrate();
  const token = authStore.getState().session?.accessToken;

  return token && token !== failedToken ? token : undefined;
};

export const setupAuthInterceptors = () => {
  const requestInterceptorId = httpClient.interceptors.request.use((config) => {
    const token = authStore.getState().session?.accessToken;

    if (token) {
      config.headers.Authorization = authModel.toAuthorizationHeader(token);
    }

    return config;
  });

  const responseInterceptorId = httpClient.interceptors.response.use(
    (response) => response,
    async (error: unknown) => {
      if (!isAxiosError(error) || !error.config) {
        throw error;
      }

      const originalRequest = error.config;

      if (error.response?.status !== 401 || originalRequest.skipAuthRefresh || originalRequest._retry) {
        throw error;
      }

      originalRequest._retry = true;
      const { clearSession } = authStore.getState().actions;
      const failedToken = authStore.getState().session?.accessToken;
      let accessToken: string;

      try {
        accessToken = await refreshOnce();
      } catch (refreshError) {
        // Сеть или 5xx на refresh — не повод разлогинивать: сессия может быть жива, следующий запрос попробует снова
        if (getApiErrorStatus(refreshError) !== 401) {
          throw error;
        }

        const tokenFromOtherTab = await getTokenFromOtherTab(failedToken);

        if (!tokenFromOtherTab) {
          clearSession();
          throw error;
        }

        accessToken = tokenFromOtherTab;
      }

      originalRequest.headers.Authorization = authModel.toAuthorizationHeader(accessToken);

      try {
        return await httpClient(originalRequest);
      } catch (retryError) {
        // Не приняли и свежий токен: сессии больше нет
        if (getApiErrorStatus(retryError) === 401) {
          clearSession();
        }

        throw retryError;
      }
    },
  );

  return () => {
    httpClient.interceptors.request.eject(requestInterceptorId);
    httpClient.interceptors.response.eject(responseInterceptorId);
  };
};
