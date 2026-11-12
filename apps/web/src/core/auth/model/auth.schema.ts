import { z } from 'zod';

import { userSchema } from '@/entities/user';
import { emailSchema } from '@/shared/lib/schemas/email.schema';

import type { ForgotPasswordInput, LoginInput, RegisterInput, Session } from './auth.types';

export const loginFormSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, 'Введите пароль'),
}) satisfies z.ZodType<LoginInput>;

export const registerFormSchema = z.object({
  name: z.string().trim().min(1, 'Введите имя').min(2, 'Имя слишком короткое').max(100, 'Не больше 100 символов'),
  email: emailSchema,
  password: z.string().min(1, 'Введите пароль').min(8, 'Минимум 8 символов').max(128, 'Не больше 128 символов'),
}) satisfies z.ZodType<RegisterInput>;

export const forgotPasswordFormSchema = z.object({
  email: emailSchema,
}) satisfies z.ZodType<ForgotPasswordInput>;

export const accessTokenSchema = z.string().min(1);

/** Сессия из localStorage: это уже модель фронта, поэтому проверяем схемой модели, а не контракта */
export const sessionSchema = z.object({
  accessToken: accessTokenSchema,
  user: userSchema,
}) satisfies z.ZodType<Session>;

export type LoginFormValues = z.input<typeof loginFormSchema>;
export type RegisterFormValues = z.input<typeof registerFormSchema>;
export type ForgotPasswordFormValues = z.input<typeof forgotPasswordFormSchema>;
