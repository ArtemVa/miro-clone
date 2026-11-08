import {
  CreateUserBodySchema,
  UserListQuerySchema,
  type CreateUserBody,
  type UserListQuery,
  type User,
  type UserList,
} from '@repo/contracts';
import { Router, type Request, type Response } from 'express';
import { HttpError } from '../../common/http-error';
import { IdParamsSchema, validateBody, validateParams, validateQuery } from '../../common/validate';
import type { UsersService } from './users.service';

// Response<User> — TypeScript не даст отдать из ручки ничего, кроме того, что описано в контракте.
// Ручки async: Express 5 сам передаёт ошибку из промиса в обработчик ошибок.
export function createUsersRouter(service: UsersService): Router {
  const router = Router();

  router.get(
    '/',
    validateQuery(UserListQuerySchema),
    async (req: Request<Record<string, string>, UserList, unknown, UserListQuery>, res: Response<UserList>) => {
      res.json(await service.list(req.query));
    },
  );

  router.get('/:id', validateParams(IdParamsSchema), async (req: Request<{ id: string }>, res: Response<User>) => {
    const user = await service.findById(req.params.id);
    if (!user) {
      throw new HttpError(404, 'NOT_FOUND', 'User not found');
    }
    res.json(user);
  });

  router.post(
    '/',
    validateBody(CreateUserBodySchema),
    async (req: Request<Record<string, string>, User, CreateUserBody>, res: Response<User>) => {
      res.status(201).json(await service.create(req.body));
    },
  );

  return router;
}
