import { delay, http, HttpResponse } from 'msw';

import type { CreateUserBody, User } from '@repo/contracts';

import { API_URLS } from '@/shared/api/constants';

import { db, toUser, type MockUser } from '../db';
import { apiUrl, errorResponse, getAuthorizedUser, unauthorizedResponse } from '../lib/http';
import { createAccessToken, createRefreshToken, refreshTokenCookie, verifyToken } from '../lib/tokens';

// Моки изображают бэк, поэтому типы запросов и ответов свои, а не из core/auth (слою mocks нельзя импортировать core)
type LoginBody = { email: string; password: string };
type RegisterBody = CreateUserBody & { password: string };
type AuthResponse = { accessToken: string; user: User };
type RefreshResponse = { accessToken: string };

/** accessToken в теле, refreshToken в cookie */
const authResponse = (user: MockUser, status = 200) =>
  HttpResponse.json<AuthResponse>(
    { accessToken: createAccessToken(user.id), user: toUser(user) },
    {
      status,
      headers: {
        'Set-Cookie': refreshTokenCookie.set(createRefreshToken(user.id)),
      },
    },
  );

export const authHandlers = [
  http.post<never, LoginBody>(apiUrl(API_URLS.auth.login), async ({ request }) => {
    await delay();
    const { email, password } = await request.json();

    const user = db.users.findOne((item) => item.email === email.trim().toLowerCase() && item.password === password);

    if (!user) return errorResponse(401, { code: 'UNAUTHORIZED', message: 'Неверный email или пароль' });

    return authResponse(user);
  }),

  http.post<never, RegisterBody>(apiUrl(API_URLS.auth.register), async ({ request }) => {
    await delay();
    const body = await request.json();
    const email = body.email.trim().toLowerCase();

    if (db.users.findOne((item) => item.email === email)) {
      return errorResponse(409, {
        code: 'CONFLICT',
        message: 'Пользователь с таким email уже существует',
        issues: [{ path: 'email', message: 'Этот email уже зарегистрирован' }],
      });
    }

    const user = db.users.insert({
      id: crypto.randomUUID(),
      name: body.name.trim(),
      email,
      password: body.password,
      createdAt: new Date().toISOString(),
    });

    return authResponse(user, 201);
  }),

  http.post(apiUrl(API_URLS.auth.refresh), async ({ cookies }) => {
    await delay();
    const userId = verifyToken(cookies[refreshTokenCookie.name], 'refresh');
    const user = userId ? db.users.findById(userId) : undefined;

    if (!user) return unauthorizedResponse();

    return HttpResponse.json<RefreshResponse>({ accessToken: createAccessToken(user.id) });
  }),

  http.post(apiUrl(API_URLS.auth.logout), async () => {
    await delay();

    return new HttpResponse(null, {
      status: 204,
      headers: { 'Set-Cookie': refreshTokenCookie.clear() },
    });
  }),

  http.get(apiUrl(API_URLS.auth.me), async ({ request }) => {
    await delay();
    const user = getAuthorizedUser(request);

    if (!user) return unauthorizedResponse();

    return HttpResponse.json(toUser(user));
  }),

  // Эндпоинта у бэка пока нет: отвечаем 204 на любой email, чтобы не раскрывать, кто зарегистрирован
  http.post(apiUrl(API_URLS.auth.forgotPassword), async () => {
    await delay();
    return new HttpResponse(null, { status: 204 });
  }),
];
