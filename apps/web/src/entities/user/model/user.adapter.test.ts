import { describe, expect, it } from 'vitest';

import { userAdapter } from './user.adapter';

const dto = {
  id: '019a6c3e-0000-7000-8000-000000000001',
  name: 'Аня Смирнова',
  email: 'anya@team.ru',
  createdAt: '2026-11-01T09:00:00.000Z',
};

describe('userAdapter.mapUser', () => {
  it('переводит DTO в модель и отбрасывает лишние поля', () => {
    expect(userAdapter.mapUser({ ...dto, passwordHash: 'x' } as typeof dto)).toEqual(dto);
  });

  it('падает на ответе, который не совпадает с контрактом', () => {
    expect(() => userAdapter.mapUser({ ...dto, email: 'not-an-email' })).toThrow();
  });
});
