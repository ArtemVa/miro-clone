import { execSync } from 'node:child_process';
import { resolve } from 'node:path';
import type { TestProject } from 'vitest/node';

// Один раз перед всеми тестами применяем миграции к тестовой базе. Если базы нет, Prisma её создаст.
// test.env из vitest.config.ts сюда не попадает, поэтому адрес базы передаём явно.
export default function setup(project: TestProject): void {
  execSync('prisma migrate deploy', {
    cwd: resolve(import.meta.dirname, '..'),
    env: { ...process.env, DATABASE_URL: project.config.env.DATABASE_URL },
    stdio: 'pipe',
  });
}
