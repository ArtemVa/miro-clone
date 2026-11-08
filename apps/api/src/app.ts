import express, { Router, type Express } from 'express';
import type { Db } from './common/db';
import { errorHandler, notFoundHandler } from './common/error-handler';
import { httpLogger } from './common/logger';
import { createUsersRepository } from './modules/users/users.repository';
import { createUsersRouter } from './modules/users/users.router';
import { createUsersService } from './modules/users/users.service';

// Клиент БД передаём снаружи: в index.ts — рабочий, в тестах — к тестовой базе.
export function createApp(db: Db): Express {
  const app = express();

  // Первым: так строку в логе и id получают все запросы, даже с битым JSON
  app.use(httpLogger);
  app.use(express.json());

  // Все эндпоинты — под /api: по префиксу сервер отличает запросы к api от страниц фронта.
  const api = Router();

  api.get('/health', (_req, res) => {
    res.json({ status: 'ok' });
  });

  // Слои собираем здесь: репозиторий → сервис → роутер (docs/backend-structure.md)
  api.use('/users', createUsersRouter(createUsersService(createUsersRepository(db))));

  app.use('/api', api);

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}
