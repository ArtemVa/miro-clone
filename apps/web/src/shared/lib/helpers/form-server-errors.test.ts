import { AxiosError, AxiosHeaders } from 'axios';
import { describe, expect, it } from 'vitest';

import type { ApiError } from '@repo/contracts';

import { toFormServerErrors } from './form-server-errors';

const values = { email: '', password: '' };
const FALLBACK = 'Не удалось';

const apiError = (data: ApiError) =>
  new AxiosError('Request failed', 'ERR_BAD_REQUEST', undefined, undefined, {
    data,
    status: 400,
    statusText: '',
    headers: {},
    config: { headers: new AxiosHeaders() },
  });

describe('toFormServerErrors', () => {
  it('без ошибки — undefined', () => {
    expect(toFormServerErrors(null, values, FALLBACK)).toBeUndefined();
  });

  it('issues по полям формы — на поля', () => {
    const error = apiError({
      code: 'CONFLICT',
      message: 'Конфликт',
      issues: [{ path: 'email', message: 'Email занят' }],
    });

    expect(toFormServerErrors(error, values, FALLBACK)).toEqual({ email: { type: 'server', message: 'Email занят' } });
  });

  it('issues по чужим полям — в root, чтобы пользователь их увидел', () => {
    const error = apiError({
      code: 'VALIDATION_ERROR',
      message: 'Ошибка',
      issues: [
        { path: 'email', message: 'Email занят' },
        { path: 'captcha', message: 'Пройдите проверку' },
      ],
    });

    expect(toFormServerErrors(error, values, FALLBACK)).toEqual({
      email: { type: 'server', message: 'Email занят' },
      root: { type: 'server', message: 'Пройдите проверку' },
    });
  });

  it('ошибка api без issues — её message в root', () => {
    const error = apiError({ code: 'BAD_REQUEST', message: 'Неверный email или пароль' });

    expect(toFormServerErrors(error, values, FALLBACK)).toEqual({
      root: { type: 'server', message: 'Неверный email или пароль' },
    });
  });

  it('не ответ api (сеть, баг) — fallback в root', () => {
    expect(toFormServerErrors(new Error('Network Error'), values, FALLBACK)).toEqual({
      root: { type: 'server', message: FALLBACK },
    });
  });
});
