import { z } from 'zod';
import { UserSchema } from './users';

export const RegisterBodySchema = UserSchema.pick({ name: true, email: true }).extend({
  password: z.string().min(8).max(128),
});

export type RegisterBody = z.infer<typeof RegisterBodySchema>;

export const LoginBodySchema = UserSchema.pick({
  email: true,
}).extend({
  password: z.string().min(1),
});

export type LoginBody = z.infer<typeof LoginBodySchema>;

// ответ — существующий UserSchema.
