# miro-clone

Монорепозиторий на pnpm workspaces + Turborepo.

```
apps/
  api/                  Express + TypeScript (монолит)
  web/                  React + Vite (фронт)
packages/
  contracts/            zod-схемы и типы — общий контракт фронта и бэка
  typescript-config/    общий tsconfig
docker-compose.yml      Postgres, Redis, MinIO и всё приложение в контейнерах
```

## Старт

Нужны Node 24 (версия в `.nvmrc`), pnpm 9 (версия зафиксирована в `packageManager`, проще всего — `corepack enable pnpm`) и Docker.

```sh
nvm install 24 && nvm use 24              # на Windows (nvm-windows) версию указываем явно
pnpm install                              # заодно ставит git-хуки
cp apps/api/.env.example apps/api/.env
docker compose up -d                      # Postgres, Redis и MinIO, адреса ниже
pnpm db:migrate                           # применить миграции к локальной базе
pnpm db:seed                              # тестовые данные, по желанию
pnpm dev                                  # api http://localhost:3000 и web http://localhost:5173
```

Сервисы из `docker-compose.yml`:

| Сервис     | Адрес                                                      | Доступ                                   |
| ---------- | ---------------------------------------------------------- | ---------------------------------------- |
| Postgres   | `localhost:5432`                                           | `app` / `app`, база `app`                |
| Redis      | `redis://localhost:6379`                                   | без пароля                               |
| MinIO (S3) | API `http://localhost:9000`, консоль http://localhost:9001 | `minioadmin` / `minioadmin`, бакет `app` |

Бакет создаётся сам при `docker compose up -d`. Порты и пароли можно поменять в `.env` рядом с `docker-compose.yml`, названия переменных есть в самом `docker-compose.yml`.

## Всё приложение в Docker

```sh
docker compose --profile app up -d --build   # http://localhost:8080, порт меняется через APP_PORT
docker compose --profile app stop
```

Что запускается вдобавок к сервисам выше:

- `migrate` применяет миграции и завершается;
- `api` стартует после миграций;
- `web`: nginx отдаёт собранный фронт и проксирует `/api` и `/ws` на api.

Для разработки удобнее `pnpm dev`: код пересобирается на лету.

## Команды

```sh
pnpm dev
pnpm lint
pnpm typecheck
pnpm test            # нужен запущенный Postgres: тесты api работают с базой app_test
pnpm build
pnpm format          # Prettier по всему репозиторию
```

Команды базы данных (`db:migrate`, `db:seed`, `db:deploy`, `db:generate`) — в [docs/database.md](docs/database.md).

Запуск задачи для одного пакета: `pnpm turbo run test --filter=@repo/api`.

## Документация

- [Ветки, коммиты и PR](docs/git-and-pr.md)
- [Контракты и ревью](docs/contracts-and-review.md)
- [Соглашения API](docs/api-conventions.md)
- [База данных](docs/database.md)
- [Структура бэка](docs/backend-structure.md)
- [Фронтенд](docs/frontend.md)

## Правила

- **`packages/contracts` зависит только от `zod`.** Никаких Node API, БД, Express — его импортирует и фронт.
- **zod, typescript, @types/node — через `catalog:`** в `pnpm-workspace.yaml`, чтобы во всём репозитории была одна версия.
- **api в прод идёт только через бандл** (`tsup`, `apps/api/dist/index.js`): contracts отдаёт сырые `.ts`, и они вшиваются в бандл при сборке. Импорты внутри api пишутся без расширений (`moduleResolution: Bundler`), поэтому запускать результат `tsc` напрямую не получится — и не нужно.
- **Переменные окружения api** описаны в `apps/api/src/config/env.ts` и проверяются при старте. Новую переменную добавляем туда и в `apps/api/.env.example`. Локально значения лежат в `apps/api/.env`, на сервере — в окружении сервера.
- **Переменные из шелла и turbo.** Turbo пропускает в задачи только переменные, перечисленные в `turbo.json`. Если переменную нужно передавать через `pnpm dev` из шелла (как `PORT=4000 pnpm dev`), её добавляют в `passThroughEnv`. На `.env` это не влияет: его api читает сам.
- **Логи в api** пишем через `logger` из `apps/api/src/common/logger.ts`, а внутри запроса — через `req.log`: к его записям уже привязан id запроса. `console` запрещён правилом ESLint. Данные передаём полями, а не в тексте: `req.log.info({ userId }, 'user created')`, а не `` `user ${userId} created` ``. Уровень задаёт `LOG_LEVEL`. Ошибки 500 отдельно логировать не нужно, их пишет обработчик ошибок. Пароли и заголовки `authorization` и `cookie` скрываются сами, но не глубже одного уровня вложенности (подробнее в `logger.ts`).
- **Общий конфиг ESLint** — `eslint.config.mjs` в корне. Правила для отдельной папки добавляются туда же блоком с `files`. Он указан в `globalDependencies` в `turbo.json`, поэтому его изменение перезапускает проверки всех пакетов.
- **`pnpm dev` в api работает через `node --watch --import tsx`, а не через `tsx watch`.** С `tsx watch` api на Windows молча зависает при импорте клиента Prisma 7: ни вывода, ни ошибки.
- **База данных** — Postgres и Prisma. Миграции и сиды пишут бэкенд-разработчики, правила — в [docs/database.md](docs/database.md).
