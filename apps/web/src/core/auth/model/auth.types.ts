import type { User } from '@/entities/user';

import type { PASSWORD_STRENGTHS } from './auth.constants';

/* ----- MODEL FOR FRONTEND ----- */

export type Session = {
  user: User;
  accessToken: string;
};

/** Сложность пароля для индикатора под полем: 0 — пусто, 4 — отличный */
export type PasswordStrength = (typeof PASSWORD_STRENGTHS)[number];

/* ----- UI TYPES ----- */

export type LoginInput = {
  email: string;
  password: string;
};

export type RegisterInput = {
  name: string;
  email: string;
  password: string;
};

export type ForgotPasswordInput = {
  email: string;
};
