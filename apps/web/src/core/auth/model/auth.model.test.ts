import { describe, expect, it } from 'vitest';

import { authModel } from './auth.model';

describe('authModel.getRedirectPath', () => {
  it('берёт pathname из state, который оставил PrivateRoute', () => {
    expect(authModel.getRedirectPath({ from: { pathname: '/b/42' } })).toBe('/b/42');
  });

  it.each([undefined, null, 'boards', {}, { from: null }, { from: { pathname: 1 } }])(
    'игнорирует чужой state: %j',
    (state) => {
      expect(authModel.getRedirectPath(state)).toBeUndefined();
    },
  );
});

describe('authModel.getPasswordStrength', () => {
  it.each([
    ['', 0],
    ['abcdefgh', 1],
    ['abcdefg1', 2],
    ['Abcdefg1', 3],
    ['Abcdefg1!', 4],
    ['Abcdefgh1234', 4],
  ])('%j → %i', (password, strength) => {
    expect(authModel.getPasswordStrength(password)).toBe(strength);
  });
});
