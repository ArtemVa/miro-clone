import { z } from 'zod';

import type { User } from './user.types';

/** Схема модели фронта: проверяет пользователя из localStorage (сессия), а не ответ api — его проверяет UserSchema из контракта */
export const userSchema = z.object({
  id: z.string().min(1),
  name: z.string(),
  email: z.string(),
  createdAt: z.string(),
}) satisfies z.ZodType<User>;
