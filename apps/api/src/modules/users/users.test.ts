import { randomUUID } from 'node:crypto';
import { ApiErrorSchema, UserListSchema, UserSchema } from '@repo/contracts';
import request from 'supertest';
import { afterAll, beforeEach, describe, expect, it } from 'vitest';
import { resetDatabase } from '../../../test/database';
import { createApp } from '../../app';
import { createDb } from '../../common/db';
import { env } from '../../config/env';

// DATABASE_URL в тестах указывает на тестовую базу, см. vitest.config.ts
const db = createDb(env.DATABASE_URL);
const app = createApp(db);

beforeEach(() => resetDatabase(db));
afterAll(() => db.$disconnect());

// Ответы проверяем теми же схемами из contracts, которыми будет пользоваться фронт:
// если API начнёт отдавать не то, что обещает контракт, тест упадёт.
describe('POST /api/users', () => {
  it('creates a user that matches the contract', async () => {
    const res = await request(app).post('/api/users').send({ name: '  Ivan  ', email: 'ivan@example.com' });

    expect(res.status).toBe(201);
    const user = UserSchema.parse(res.body);
    expect(user.name).toBe('Ivan');
  });

  it('rejects a body that violates the contract', async () => {
    const res = await request(app).post('/api/users').send({ name: 'I' });

    expect(res.status).toBe(400);
    const error = ApiErrorSchema.parse(res.body);
    expect(error.code).toBe('VALIDATION_ERROR');
    expect(error.issues?.map((issue) => issue.path)).toEqual(['name', 'email']);
  });

  it('returns CONFLICT for a duplicate email', async () => {
    const body = { name: 'Ivan', email: 'ivan@example.com' };

    await request(app).post('/api/users').send(body).expect(201);
    const res = await request(app).post('/api/users').send(body);

    expect(res.status).toBe(409);
    expect(ApiErrorSchema.parse(res.body).code).toBe('CONFLICT');
  });
});

describe('GET /api/users/:id', () => {
  it('returns the user', async () => {
    const created = await request(app).post('/api/users').send({ name: 'Ivan', email: 'ivan@example.com' });

    const res = await request(app).get(`/api/users/${created.body.id}`);

    expect(res.status).toBe(200);
    expect(UserSchema.parse(res.body)).toEqual(created.body);
  });

  it('returns NOT_FOUND for an unknown id', async () => {
    const res = await request(app).get(`/api/users/${randomUUID()}`);

    expect(res.status).toBe(404);
    expect(ApiErrorSchema.parse(res.body).code).toBe('NOT_FOUND');
  });

  it('rejects an id that is not a uuid', async () => {
    const res = await request(app).get('/api/users/abc');

    expect(res.status).toBe(400);
    const error = ApiErrorSchema.parse(res.body);
    expect(error.code).toBe('VALIDATION_ERROR');
    expect(error.issues?.map((issue) => issue.path)).toEqual(['id']);
  });
});

describe('GET /api/users', () => {
  // Создаём в базе напрямую, чтобы задать createdAt: порядок по нему отличается от порядка по имени
  async function seedUsers() {
    await db.user.createMany({
      data: [
        { name: 'Boris', email: 'boris@example.com', createdAt: new Date('2026-01-01T00:00:00Z') },
        { name: 'Anna', email: 'anna@example.com', createdAt: new Date('2026-01-02T00:00:00Z') },
        { name: 'Vera', email: 'vera@example.com', createdAt: new Date('2026-01-03T00:00:00Z') },
      ],
    });
  }

  async function names(query: string) {
    const res = await request(app).get(`/api/users${query}`).expect(200);
    return UserListSchema.parse(res.body).items.map((user) => user.name);
  }

  it('returns pages that match the contract', async () => {
    await seedUsers();

    const first = UserListSchema.parse((await request(app).get('/api/users?sort=name&order=asc&pageSize=2')).body);
    expect(first.items.map((user) => user.name)).toEqual(['Anna', 'Boris']);
    expect(first).toMatchObject({ total: 3, page: 1, pageSize: 2 });

    expect(await names('?sort=name&order=asc&page=2&pageSize=2')).toEqual(['Vera']);
    expect(await names('?sort=name&order=asc&page=3&pageSize=2')).toEqual([]);
  });

  it('sorts newest first by default', async () => {
    await seedUsers();

    expect(await names('')).toEqual(['Vera', 'Anna', 'Boris']);
  });

  it('sorts by the requested field and order', async () => {
    await seedUsers();

    expect(await names('?sort=name&order=asc')).toEqual(['Anna', 'Boris', 'Vera']);
    expect(await names('?sort=createdAt&order=asc')).toEqual(['Boris', 'Anna', 'Vera']);
    // Без order берётся порядок по умолчанию для списка — desc
    expect(await names('?sort=name')).toEqual(['Vera', 'Boris', 'Anna']);
  });

  it('uses page 1 and pageSize 20 by default', async () => {
    const res = await request(app).get('/api/users');

    expect(res.status).toBe(200);
    expect(UserListSchema.parse(res.body)).toEqual({ items: [], total: 0, page: 1, pageSize: 20 });
  });

  it('rejects invalid list params', async () => {
    const res = await request(app).get('/api/users?page=0&pageSize=101&sort=email&order=up');

    expect(res.status).toBe(400);
    const error = ApiErrorSchema.parse(res.body);
    expect(error.code).toBe('VALIDATION_ERROR');
    expect(error.issues?.map((issue) => issue.path)).toEqual(['page', 'pageSize', 'sort', 'order']);
  });
});
