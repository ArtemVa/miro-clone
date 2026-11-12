import { env } from '@/shared/config/env/config';

/** Адрес api: baseURL для httpClient. Без слэша в конце */
export const API_BASE_URL = env.VITE_APP_API_URL.replace(/\/+$/, '');

/** Пути эндпоинтов относительно API_BASE_URL */
export const API_URLS = {
  auth: {
    login: '/auth/login',
    register: '/auth/register',
    refresh: '/auth/refresh',
    logout: '/auth/logout',
    me: '/auth/me',
    forgotPassword: '/auth/forgot-password',
  },
  featureFlags: {
    list: '/feature-flags',
  },
} as const;
