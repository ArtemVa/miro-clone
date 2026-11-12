export const SESSION_STORAGE_KEY = 'session';

/** Уровни сложности пароля: 0 — пусто, 4 — отличный. Уровень = число выполненных проверок в getPasswordStrength */
export const PASSWORD_STRENGTHS = [0, 1, 2, 3, 4] as const;
