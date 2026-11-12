import { z } from 'zod';

import { PASSWORD_STRENGTHS } from './auth.constants';
import { sessionSchema } from './auth.schema';
import type { PasswordStrength, Session } from './auth.types';

export const authModel = {
  getPersistedSession: (persisted: unknown): Session | null => {
    const result = z.object({ session: sessionSchema }).safeParse(persisted);
    return result.success ? result.data.session : null;
  },

  getRedirectPath: (locationState: unknown): string | undefined => {
    if (typeof locationState !== 'object' || locationState === null || !('from' in locationState)) {
      return undefined;
    }

    const { from } = locationState;

    return typeof from === 'object' && from !== null && 'pathname' in from && typeof from.pathname === 'string'
      ? from.pathname
      : undefined;
  },

  getPasswordStrength: (password: string): PasswordStrength => {
    const checks = [
      password.length >= 8,
      /\d/.test(password),
      /[A-ZА-ЯЁ]/.test(password) && /[a-zа-яё]/.test(password),
      password.length >= 12 || /[^\p{L}\d]/u.test(password),
    ];

    return password ? PASSWORD_STRENGTHS[checks.filter(Boolean).length] : 0;
  },
};
