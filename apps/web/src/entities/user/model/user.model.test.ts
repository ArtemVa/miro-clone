import { describe, expect, it } from 'vitest';

import { userModel } from './user.model';

describe('userModel.getInitials', () => {
  it.each([
    ['Аня Смирнова', 'АС'],
    ['anya', 'A'],
    ['  Иван   Петрович Сидоров ', 'ИП'],
  ])('%s → %s', (name, initials) => {
    expect(userModel.getInitials({ name })).toBe(initials);
  });
});

describe('userModel.getAvatarColor', () => {
  it('стабилен для одного id и берётся из палитры presence', () => {
    const id = '019a6c3e-0000-7000-8000-000000000001';

    expect(userModel.getAvatarColor({ id })).toBe(userModel.getAvatarColor({ id }));
    expect(userModel.getAvatarColor({ id })).toMatch(/^var\(--presence-[1-8]\)$/);
  });
});
