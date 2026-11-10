import { z } from 'zod';
import { UserSchema } from './users';

export const RegisterBodySchema = UserSchema.pick({ name: true, email: true }).extend({
  password: z
    .string()
    .min(8, 'Пароль должен быть не менее 8 символов')
    .max(128, 'Пароль не должен превышать 128 символов'),
});

export type RegisterBody = z.infer<typeof RegisterBodySchema>;

export const LoginBodySchema = z.object({
  email: z.email('Некорректный формат email'),
  password: z.string().min(1, 'Пароль обязателен'),
});

export type LoginBody = z.infer<typeof LoginBodySchema>;

// ответ — существующий UserSchema.
