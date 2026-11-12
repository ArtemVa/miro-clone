import { z } from 'zod';

/** Email в формах: обязательный, без пробелов по краям */
export const emailSchema = z.string().trim().min(1, 'Введите email').pipe(z.email('Похоже, в email опечатка'));
