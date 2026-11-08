import type { CreateUserBody, User, UserList, UserListQuery } from '@repo/contracts';
import { UniqueViolationError } from '../../common/db-errors';
import { HttpError } from '../../common/http-error';
import type { UserRow, UsersRepository } from './users.repository';

// С базой сервис работает только через репозиторий. Наружу отдаёт только типы из contracts.
export function createUsersService(repository: UsersRepository) {
  return {
    async list(query: UserListQuery): Promise<UserList> {
      const { rows, total } = await repository.list(query);
      return { items: rows.map(toUser), total, page: query.page, pageSize: query.pageSize };
    },

    async findById(id: string): Promise<User | null> {
      const row = await repository.findById(id);
      return row && toUser(row);
    },

    async create(body: CreateUserBody): Promise<User> {
      try {
        return toUser(await repository.create(body));
      } catch (error) {
        if (error instanceof UniqueViolationError) {
          throw new HttpError(409, 'CONFLICT', 'Email is already taken');
        }
        throw error;
      }
    },
  };
}

export type UsersService = ReturnType<typeof createUsersService>;

// Строка из базы → формат контракта. Наружу отдаём только то, что описано в контракте.
function toUser(row: UserRow): User {
  return { id: row.id, name: row.name, email: row.email, createdAt: row.createdAt.toISOString() };
}
