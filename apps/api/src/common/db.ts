import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '../generated/prisma/client';

// У каждого клиента свой пул соединений, поэтому на процесс создаём один (в index.ts) и передаём его дальше.
export function createDb(databaseUrl: string): PrismaClient {
  return new PrismaClient({ adapter: new PrismaPg({ connectionString: databaseUrl }) });
}

export type Db = PrismaClient;
