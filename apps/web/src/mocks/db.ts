import type { User } from '@repo/contracts';

import { createCollection } from './lib/collection';

/** Пользователь в мок-базе: User из контракта + пароль (наружу пароль не отдаётся) */
export type MockUser = User & { password: string };

export const DEMO_USER: MockUser = {
  id: '019a6c3e-0000-7000-8000-000000000001',
  name: 'Демо Пользователь',
  email: 'demo@example.com',
  password: 'Demo1234',
  createdAt: '2026-11-01T09:00:00.000Z',
};

export const db = {
  // Версия в ключе: при смене формата пользователя старые данные из localStorage не подхватываются
  users: createCollection<MockUser>('msw:users:v2', [DEMO_USER]),
};

export const toUser = ({ password: _password, ...user }: MockUser): User => user;
