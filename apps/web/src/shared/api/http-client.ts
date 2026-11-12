import axios, { isAxiosError } from 'axios';

import type { ApiError } from '@repo/contracts';

import { API_BASE_URL } from './constants';

export const httpClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

/** Тело ошибки api (ApiErrorSchema из contracts) или undefined, если это не ответ api */
export const getApiError = (error: unknown): ApiError | undefined => {
  if (!isAxiosError<ApiError>(error)) {
    return undefined;
  }

  const data = error.response?.data;

  return data && typeof data.message === 'string' ? data : undefined;
};

export const getApiErrorMessage = (error: unknown): string | undefined => {
  return getApiError(error)?.message;
};

export const getApiErrorStatus = (error: unknown): number | undefined => {
  return isAxiosError(error) ? error.response?.status : undefined;
};
