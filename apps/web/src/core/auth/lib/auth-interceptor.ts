import { isAxiosError } from 'axios';

import { httpClient } from '@/shared/api/http-client';

import { authStore } from '../store/auth.store';

declare module 'axios' {
  interface AxiosRequestConfig {
    skipAuthRefresh?: boolean;
    _retry?: boolean;
  }
}

let refreshPromise: Promise<string> | null = null;

export const setupAuthInterceptors = () => {
  const requestInterceptorId = httpClient.interceptors.request.use((config) => {
    const token = authStore.getState().session?.accessToken;

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
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
      const { refreshToken, clearSession } = authStore.getState().actions;

      try {
        refreshPromise ??= refreshToken().finally(() => {
          refreshPromise = null;
        });

        const newToken = await refreshPromise;
        originalRequest.headers.Authorization = `Bearer ${newToken}`;

        return httpClient(originalRequest);
      } catch {
        clearSession();
        throw error;
      }
    },
  );

  return () => {
    httpClient.interceptors.request.eject(requestInterceptorId);
    httpClient.interceptors.response.eject(responseInterceptorId);
  };
};
