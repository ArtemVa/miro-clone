import { z } from 'zod';

// Все переменные окружения, которые читает api. Новую переменную добавляем сюда и в .env.example.
const EnvSchema = z.object({
  PORT: z.coerce.number().int().positive().default(3000),
  LOG_LEVEL: z.enum(['fatal', 'error', 'warn', 'info', 'debug', 'trace', 'silent']).default('info'),
  DATABASE_URL: z.url({ protocol: /^postgres(ql)?$/ }),
});

const result = EnvSchema.safeParse(process.env);

if (!result.success) {
  // eslint-disable-next-line no-console -- логгера ещё нет: ему самому нужен env
  console.error(`Invalid environment variables:\n${z.prettifyError(result.error)}`);
  process.exit(1);
}

export const env = result.data;
