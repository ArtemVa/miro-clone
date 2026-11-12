import { describe, expect, it } from 'vitest';

import { envVariablesSchema } from './env-schema';

describe('envVariablesSchema', () => {
  it('без .env подставляет значения по умолчанию', () => {
    expect(envVariablesSchema.parse({})).toEqual({
      VITE_APP_DOMAIN: 'localhost',
      VITE_APP_API_URL: '/api',
      VITE_APP_API_MOCKS: false,
      VITE_APP_API_PROXY_TARGET: 'http://localhost:3000',
      VITE_APP_SENTRY_DSN: '',
    });
  });

  it('превращает VITE_APP_API_MOCKS в boolean', () => {
    expect(envVariablesSchema.parse({ VITE_APP_API_MOCKS: 'true' }).VITE_APP_API_MOCKS).toBe(true);
  });

  it('не принимает DSN, который не похож на URL', () => {
    expect(envVariablesSchema.safeParse({ VITE_APP_SENTRY_DSN: 'not-a-url' }).success).toBe(false);
  });
});
