import { createDb } from '../src/common/db';
import { logger } from '../src/common/logger';
import { env } from '../src/config/env';

// Данные для локальной разработки: pnpm db:seed.
// Можно запускать повторно: записи с уже существующим email пропускаются.
const users = Array.from({ length: 30 }, (_, i) => ({
  name: `User ${i + 1}`,
  email: `user${i + 1}@example.com`,
}));

const db = createDb(env.DATABASE_URL);

try {
  const { count } = await db.user.createMany({ data: users, skipDuplicates: true });
  logger.info({ created: count }, 'seed completed');
} finally {
  await db.$disconnect();
}
