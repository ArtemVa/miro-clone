import type { CreateUserBody, UserListQuery } from '@repo/contracts';
import type { Db } from '../../common/db';
import { isUniqueViolation, UniqueViolationError } from '../../common/db-errors';
import type { Prisma, User } from '../../generated/prisma/client';

// Строка таблицы users. Сервис берёт тип отсюда, а не из клиента Prisma.
export type UserRow = User;

export function createUsersRepository(db: Db) {
  return {
    // Сортировка и пагинация — в запросе к базе. id последним, чтобы порядок был однозначным.
    async list({ page, pageSize, sort, order }: UserListQuery): Promise<{ rows: UserRow[]; total: number }> {
      // Фильтры списка пойдут сюда. Тот же where — и в count, иначе total не совпадёт с выборкой.
      const where: Prisma.UserWhereInput = {};
      const [rows, total] = await db.$transaction([
        db.user.findMany({
          where,
          orderBy: [{ [sort]: order }, { id: order }],
          skip: (page - 1) * pageSize,
          take: pageSize,
        }),
        db.user.count({ where }),
      ]);
      return { rows, total };
    },

    findById(id: string): Promise<UserRow | null> {
      return db.user.findUnique({ where: { id } });
    },

    // Уникальность email держит UNIQUE-ограничение в базе, а не проверка в коде:
    // проверка в коде пропустила бы два одновременных запроса с одним email.
    async create(data: CreateUserBody): Promise<UserRow> {
      try {
        return await db.user.create({ data });
      } catch (error) {
        if (isUniqueViolation(error)) {
          throw new UniqueViolationError(error);
        }
        throw error;
      }
    },
  };
}

export type UsersRepository = ReturnType<typeof createUsersRepository>;
