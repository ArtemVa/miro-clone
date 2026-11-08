import { Prisma } from '../generated/prisma/client';

// Нарушено ограничение уникальности (код Prisma P2002).
// Репозиторий бросает эту ошибку вместо ошибки Prisma, чтобы сервис не зависел от Prisma.
export class UniqueViolationError extends Error {
  constructor(cause: unknown) {
    super('Unique constraint violated', { cause });
    this.name = 'UniqueViolationError';
  }
}

export function isUniqueViolation(error: unknown): boolean {
  return error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002';
}
