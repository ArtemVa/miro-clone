import { existsSync } from 'node:fs';
import { defineConfig } from 'prisma/config';

// Prisma сама .env не читает. Локально подгружаем его, на сервере переменные уже в окружении.
// Уже заданные переменные loadEnvFile не перезаписывает.
if (existsSync('.env')) process.loadEnvFile('.env');

export default defineConfig({
  schema: 'prisma/schema.prisma',
  migrations: {
    path: 'prisma/migrations',
    seed: 'tsx prisma/seed.ts',
  },
  datasource: {
    url: process.env.DATABASE_URL,
  },
});
