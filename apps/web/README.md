# @repo/web

Фронт Tandem: React 19, Vite, TypeScript. Архитектура и соглашения — [docs/frontend.md](../../docs/frontend.md).

## Быстрый старт (без бэка)

Нужны Node 24 и pnpm 9. Проще всего включить pnpm через corepack: `corepack enable pnpm`.

Из корня репозитория:

```sh
pnpm install
pnpm --filter @repo/web dev:mocks
```

Открыть http://localhost:5173 и войти демо-аккаунтом `demo@example.com` / `Demo1234`.

В этом режиме запросы к api перехватывает MSW (`src/mocks`), бэк и Docker не нужны. Данные моков лежат в localStorage браузера: чтобы начать с чистой базы, удалите ключи `msw:*`.

## С настоящим бэком

Бэку нужны Docker и `.env`, шаги — в [корневом README](../../README.md#старт). После них `pnpm dev` из корня поднимает api на http://localhost:3000 и фронт на http://localhost:5173.

Только фронт при уже запущенном api: `pnpm --filter @repo/web dev`.

## Команды

Из корня, через `pnpm --filter @repo/web <команда>`:

| Команда        | Что делает                                 |
| -------------- | ------------------------------------------ |
| `dev:mocks`    | dev-сервер на моках                        |
| `dev`          | dev-сервер, `/api` проксируется на бэк     |
| `build`        | прод-сборка в `dist/`                      |
| `preview`      | локально открыть прод-сборку               |
| `test`         | тесты один раз (`test:watch` — с вотчером) |
| `lint`         | ESLint                                     |
| `typecheck`    | проверка типов                             |
| `storybook`    | Storybook на http://localhost:6006         |
| `add:ui <имя>` | добавить компонент shadcn                  |

Переменные окружения необязательные, список — в [.env.example](.env.example). Свои значения — в `.env.local`.
