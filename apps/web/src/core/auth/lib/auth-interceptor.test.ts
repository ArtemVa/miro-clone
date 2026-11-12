import { AxiosError, type AxiosAdapter, type AxiosResponse, type InternalAxiosRequestConfig } from 'axios';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { API_URLS } from '@/shared/api/constants';
import { httpClient } from '@/shared/api/http-client';

import { SESSION_STORAGE_KEY } from '../model/auth.constants';
import type { Session } from '../model/auth.types';
import { authStore } from '../store/auth.store';
import { setupAuthInterceptors } from './auth-interceptor';

const user = {
  id: 'user-1',
  name: 'Аня Смирнова',
  email: 'anya@team.ru',
  createdAt: '2026-11-01T09:00:00.000Z',
};

const PROTECTED_URL = '/boards';

const response = (config: InternalAxiosRequestConfig, status: number, data: unknown = {}): AxiosResponse => ({
  config,
  status,
  data,
  statusText: '',
  headers: {},
});

const unauthorized = (config: InternalAxiosRequestConfig) =>
  new AxiosError('Unauthorized', AxiosError.ERR_BAD_REQUEST, config, null, response(config, 401));

const authHeader = (config: InternalAxiosRequestConfig) => String(config.headers.Authorization);

/** Вкладка, которая успела обновить токены раньше: её сессия уже лежит в localStorage */
const saveSessionFromOtherTab = (session: Session) =>
  localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify({ state: { session }, version: 0 }));

/** Сервер: защищённый адрес пускает только с validToken, refresh отвечает по refreshResult */
const mockServer = ({ validToken, refreshResult }: { validToken: string; refreshResult: () => string | null }) =>
  vi.fn<AxiosAdapter>(async (config) => {
    if (config.url === API_URLS.auth.refresh) {
      const token = refreshResult();
      if (!token) throw unauthorized(config);
      return response(config, 200, { accessToken: token });
    }

    if (authHeader(config) !== `Bearer ${validToken}`) throw unauthorized(config);
    return response(config, 200, { ok: true });
  });

let ejectInterceptors: () => void;

beforeEach(() => {
  localStorage.clear();
  authStore.setState({ session: { accessToken: 'expired', user } });
  ejectInterceptors = setupAuthInterceptors();
});

afterEach(() => {
  ejectInterceptors();
  httpClient.defaults.adapter = undefined;
});

describe('auth-интерцептор', () => {
  it('на 401 обновляет токен и повторяет запрос, refresh один на все параллельные запросы', async () => {
    const server = mockServer({ validToken: 'fresh', refreshResult: () => 'fresh' });
    httpClient.defaults.adapter = server;

    const results = await Promise.all([httpClient.get(PROTECTED_URL), httpClient.get(PROTECTED_URL)]);

    expect(results.map((result) => result.status)).toEqual([200, 200]);
    expect(server.mock.calls.filter(([config]) => config.url === API_URLS.auth.refresh)).toHaveLength(1);
    expect(authStore.getState().session?.accessToken).toBe('fresh');
  });

  it('если refresh вернул 401, берёт токен, который обновила другая вкладка', async () => {
    httpClient.defaults.adapter = mockServer({
      validToken: 'from-other-tab',
      refreshResult: () => {
        saveSessionFromOtherTab({ accessToken: 'from-other-tab', user });
        return null;
      },
    });

    const result = await httpClient.get(PROTECTED_URL);

    expect(result.status).toBe(200);
    expect(authStore.getState().session?.accessToken).toBe('from-other-tab');
  });

  it('если refresh вернул 401 и свежего токена нет, завершает сессию', async () => {
    httpClient.defaults.adapter = mockServer({ validToken: 'fresh', refreshResult: () => null });

    await expect(httpClient.get(PROTECTED_URL)).rejects.toMatchObject({ response: { status: 401 } });
    expect(authStore.getState().session).toBeNull();
  });

  it('если и повтор со свежим токеном вернул 401, завершает сессию', async () => {
    httpClient.defaults.adapter = mockServer({ validToken: 'never', refreshResult: () => 'fresh' });

    await expect(httpClient.get(PROTECTED_URL)).rejects.toMatchObject({ response: { status: 401 } });
    expect(authStore.getState().session).toBeNull();
  });

  it('при сетевой ошибке на refresh сессию не трогает', async () => {
    httpClient.defaults.adapter = vi.fn<AxiosAdapter>(async (config) => {
      if (config.url === API_URLS.auth.refresh) throw new AxiosError('Network Error', AxiosError.ERR_NETWORK, config);
      throw unauthorized(config);
    });

    await expect(httpClient.get(PROTECTED_URL)).rejects.toBeInstanceOf(AxiosError);
    expect(authStore.getState().session?.accessToken).toBe('expired');
  });
});
