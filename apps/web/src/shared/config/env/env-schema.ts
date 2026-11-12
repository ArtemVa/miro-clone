import { z } from 'zod';

// У каждой переменной есть значение по умолчанию: сборка в Docker идёт без .env (его отрезает .dockerignore),
// и `pnpm dev` работает сразу после клонирования. Переопределить: apps/web/.env.local, список — в .env.example.
export const envVariablesSchema = z.object({
  VITE_APP_DOMAIN: z.string().min(1).default('localhost'),
  VITE_APP_API_URL: z.string().min(1).default('/api'),
  VITE_APP_API_MOCKS: z
    .enum(['true', 'false'])
    .default('false')
    .transform((value) => value === 'true'),
  // Куда dev-сервер Vite проксирует /api и /ws (vite.config.ts). Порт — PORT из apps/api/.env
  VITE_APP_API_PROXY_TARGET: z.url().default('http://localhost:3000'),
  // DSN проекта в Sentry/GlitchTip. Пусто — мониторинг ошибок выключен
  VITE_APP_SENTRY_DSN: z.union([z.url(), z.literal('')]).default(''),
});

export type EnvVariables = z.infer<typeof envVariablesSchema>;
