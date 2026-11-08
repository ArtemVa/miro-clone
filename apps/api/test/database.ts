import type { Db } from '../src/common/db';

// Очищает все таблицы, кроме служебной таблицы миграций Prisma.
// Работает только с базой, имя которой кончается на _test, чтобы случайно не стереть рабочую.
export async function resetDatabase(db: Db): Promise<void> {
  const [{ name }] = await db.$queryRaw<{ name: string }[]>`SELECT current_database() AS name`;
  if (!name.endsWith('_test')) {
    throw new Error(`Refusing to truncate tables in "${name}": tests must run against a *_test database`);
  }

  const tables = await db.$queryRaw<{ tablename: string }[]>`
    SELECT tablename FROM pg_tables WHERE schemaname = 'public' AND tablename <> '_prisma_migrations'
  `;
  if (tables.length === 0) return;

  const names = tables.map(({ tablename }) => `"${tablename}"`).join(', ');
  await db.$executeRawUnsafe(`TRUNCATE ${names} RESTART IDENTITY CASCADE`);
}
