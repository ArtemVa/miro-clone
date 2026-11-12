import type { PasswordStrength } from '@/core/auth';

export const STRENGTH_STEPS = [1, 2, 3, 4] as const;

// У 0 нет закрашенных полосок, цвет для него совпадает с пустой полоской
export const BAR_COLORS: Record<PasswordStrength, string> = {
  0: 'bg-muted',
  1: 'bg-destructive',
  2: 'bg-warning',
  3: 'bg-primary',
  4: 'bg-success',
};

export const HINTS: Record<PasswordStrength, string> = {
  0: 'Минимум 8 символов, лучше с цифрами и разным регистром',
  1: 'Слишком простой',
  2: 'Можно лучше',
  3: 'Хороший пароль',
  4: 'Отличный пароль',
};
