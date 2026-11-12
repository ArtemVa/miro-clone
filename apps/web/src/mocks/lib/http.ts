import { HttpResponse } from 'msw';

import type { ApiError } from '@repo/contracts';

import { API_BASE_URL } from '@/shared/api/constants';

import { db, type MockUser } from '../db';
import { verifyToken } from './tokens';

// UNAUTHORIZED есть в контракте ветки feat/b-01-auth-contract, в dev его ещё нет
type MockApiError = Omit<ApiError, 'code'> & { code: ApiError['code'] | 'UNAUTHORIZED' };

/** Полный адрес для хендлера: httpClient ходит на API_BASE_URL + путь из API_URLS */
export const apiUrl = (path: string) => `${API_BASE_URL}${path}`;

/** Ошибка в формате контракта: { code, message, issues? } */
export const errorResponse = (status: number, body: MockApiError) => HttpResponse.json(body, { status });

export const unauthorizedResponse = () =>
  errorResponse(401, { code: 'UNAUTHORIZED', message: 'Требуется авторизация' });

/** Пользователь из заголовка `Authorization: Bearer <accessToken>` */
export const getAuthorizedUser = (request: Request): MockUser | undefined => {
  const token = request.headers.get('Authorization')?.replace(/^Bearer\s+/, '');
  const userId = verifyToken(token, 'access');

  return userId ? db.users.findById(userId) : undefined;
};
