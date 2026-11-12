# Контекст работы над фронтом (передача между сессиями)

Документ для новой сессии Claude: что сделано, как устроено, какие договорённости, что дальше. Состояние на 2026-11-12 (после захода по todos.md).

Рядом лежит [todos.md](todos.md) — список задач от пользователя на следующий заход. Командная документация фронта — [docs/frontend.md](../../../docs/frontend.md) в корне репозитория.

## Проект

- **Tandem** — аналог Miro (учебный проект, поток 3, ТЗ: `D:\it\frontend\work\ulbi\3 поток. ТЗ - Аналог MIRO.pdf`).
- Монорепа: `D:\it\frontend\work\ulbi\miro-clone`, GitHub `ArtemVa/miro-clone`. pnpm 9 workspaces + Turborepo.
  - `apps/web` — фронт (наша зона), `apps/api` — бэк (другие люди), `packages/contracts` — zod-контракты (`@repo/contracts`), `packages/typescript-config`.
- Текущая ветка: `chore/web-template` (от `dev`). **Ничего не закоммичено** — пользователь коммитит сам. Не коммитить, не пушить без явной просьбы.
- Дизайн-прототипы (HTML): `D:\it\frontend\work\ulbi\design\` — `auth.html`, `dashboard.html`, `board.html`, `settings.html`, `workspace.html`, `landing.html`, `handoff.html` (токены, константы холста), `assets/tokens.css`. Смотреть: launch-конфиг `design` (порт 5178).
- Исходный шаблон фронта, который переносили: `D:\it\frontend\work\ulbi\template\`.
- Пример того, как пользователь делал DTO → adapter → модель фронта: `D:\it\frontend\work\edenex-monorepo-production\edenex-monorepo-prod\apps` (`dftp-web`, `platform-server`).
- Launch-конфиги (вне репо): `D:\it\frontend\work\ulbi\.claude\launch.json` — `design` (5178), `web-mocks` (5174, `dev:mocks`), `web` (5173), `api` (3000).

## Как работать с пользователем

- Общение на русском. Код и комментарии — на русском, коммиты — на английском (conventional commits, commitlint).
- Пользователь любит идти по шагам: предлагаешь шаг → он смотрит → «ок, дальше» или правки. Большие переделки — только когда сам просит «одним заходом».
- Вопросы к бэку (транспорт auth: cookie или токены, socket.io или ws, и т.д.) **отложены**, пользователь решит позже. Не поднимать без повода.
- Стек не догма, можно предлагать лучше, но объяснять зачем.
- Пользователь сам правит код между сессиями. Если файл изменился — это его решение, не откатывать; если выглядит ошибкой — сказать.
- Email пользователя и прочие личные данные не отправлять во внешние сервисы. Секреты не коммитить.
- Windows: файлы писать с LF (Write-инструмент или Python с `newline='\n'`). Длинные bash-heredoc с кириллицей и кавычками иногда ломаются — надёжнее положить скрипт в scratchpad через Write и запустить.

## Что сделано

### 1. Перенос шаблона в монорепу (шаги 0–7, принято пользователем)

- `apps/web` = `@repo/web`. Скрипты: `dev`, `dev:mocks` (`vite --mode mocks`), `build`, `preview`, `typecheck` (`tsc -b`), `lint`, `test`, `test:watch`, `storybook`, `build-storybook`, `add:ui` (shadcn), `add:hook` (reactuse).
- `vite.config.ts`: env проверяется схемой (`envVariablesSchema` из `src/shared/config/env/env-schema.ts`, импорт с `.ts` — требование нативного загрузчика Vite), `envPrefix: 'VITE_APP_'`, прокси `[VITE_APP_API_URL]` и `/ws` (`ws: true`) на `VITE_APP_API_PROXY_TARGET`, секция `test` для Vitest.
- Env: `VITE_APP_DOMAIN`, `VITE_APP_API_URL` (`/api`), `VITE_APP_API_MOCKS`, `VITE_APP_API_PROXY_TARGET` (`http://localhost:3000`), `VITE_APP_SENTRY_DSN` (пусто = выкл). У всех есть дефолты. `.env.example`, `.env.mocks` (закоммичен, в `.gitignore` исключение).
- tsconfig: `tsconfig.json` (solution: references app/node/storybook + `paths` для shadcn CLI), `tsconfig.app.json` (src, строгие флаги, `@/*`), `tsconfig.node.json` (vite.config.ts), `.storybook/tsconfig.json` (явный список файлов — TS-глобы пропускают dot-папки, а typescript-eslint ищет ближайший tsconfig.json).
- `apps/web/turbo.json`: `build` зависит от `VITE_APP_*` и `.env*`.
- Корневой `eslint.config.mjs` (один на репо): `WEB_LAYERS` + `eslint-plugin-boundaries` (слои), `eslint-plugin-check-file` (kebab-case), import resolver на `apps/web/tsconfig.app.json`, игноры `mockServiceWorker.js`, `storybook-static`.
- Корневой `.prettierrc`: для `apps/web/**` плагин `@ianvs/prettier-plugin-sort-imports` (группы: внешние | `@repo/*` | `@/app`…`@/mocks` по слоям | относительные).
- CI: `turbo --affected` на lint, typecheck, test, build. Husky + lint-staged + commitlint.

### 2. Рефакторинг (сделан одним заходом, не закоммичен)

- **i18n удалён** полностью, строки на русском.
- **Дизайн Tandem**: токены в `src/app/styles/index.css` (`:root` / `.dark`, `@theme inline`): `primary`, `ai`/`ai-soft`/`ai-border` (фиолетовый — только для ИИ), `success`, `warning`, `destructive`, `canvas`, `canvas-dot`, `selection`, `sticky-*`, `presence-1..8`, тени `island/pop/sticky`, утилиты `island`, `canvas-dots`, `sticky-note`, `shimmer`, `scrollbar-thin`. Шрифт Inter (`@fontsource-variable/inter`). Lucide stroke 1.75.
- UI: Button — варианты `ai`, `ai-soft`; новые `Badge`, `Island`, `Logo`, `PasswordField`. `shared/config/board.ts` — константы холста из handoff (`STICKY_COLORS`, `presenceColor`, `BOARD`, `TIMINGS`, `MOTION`, `Z`, `HOTKEYS`).
- **TanStack Query** вместо самописного `useQuery`/`useAsync`: `shared/api/query-client.ts` (staleTime 30s, retry только 5xx/сеть до 2 раз, мутации без retry), `QueryClientProvider` в `app.tsx`, devtools в dev (правый нижний угол, под кнопкой фича-флагов). Правило: **Query — серверные данные, zustand — сессия/тема/флаги/UI**. Реальных `useQuery` пока нет — первым будет список досок.
- **Контракты вместо `shared/dto`**. Глобальные роли (ADMIN/STANDARD/READ_ONLY) убраны, у пользователя `name` вместо firstName/lastName.
- Ошибки api: `getApiError`/`getApiErrorMessage`/`getApiErrorStatus` в `http-client.ts`; `setFormApiErrors` раскладывает `issues` по полям, остальное в `root`. Сервисы тостов не показывают, ошибки ловит фасад.
- `core/auth`: схемы `loginFormSchema`/`registerFormSchema` (name 2–100, password 8–128)/`forgotPasswordFormSchema`/`sessionSchema`, adapter парсит ответы zod-ом, `authModel.getPasswordStrength`, `authService.requestPasswordReset`, `GuestRoute` → `/boards`, `PrivateRoute` → `/auth/login` с `state.from`.
- `core/feature-flags`: ошибка загрузки — тихий фолбэк на дефолты (эндпоинта у бэка нет). Тема (`ThemeSwitch`) спрятана за флагом `theme`.
- **Роуты** (`shared/routes.ts`) и **лейауты** (`app/layouts/`): `/` LandingLayout; `/auth/login|register|forgot-password` — GuestRoute → AuthLayout (форма слева, холст со стикерами справа, по `design/auth.html`, без OAuth); `/boards`, `/settings` — PrivateRoute → AppLayout (сайдбар); `/b/:boardId` — PrivateRoute → BoardLayout (холст на весь экран); `*` not-found.
- Страницы: landing, login, register (с индикатором сложности пароля), forgot-password (форма → экран «Проверьте почту» с повторной отправкой), boards (EmptyState), settings (карточка профиля), not-found.
- Моки (MSW): `src/mocks` — `db.ts` (localStorage, ключ `msw:users:v2`), демо-аккаунт **`demo@example.com` / `Demo1234`**; login 401 `UNAUTHORIZED`, register 409 `CONFLICT` с issue на `email`, refresh/logout/me, forgot-password всегда 204. Типы в моках локальные (слою mocks нельзя импортировать core).
- **Мониторинг**: Sentry через динамический импорт, только при заданном DSN; `initMonitoring()` в `main.tsx` параллельно с MSW, падение SDK не блокирует рендер; `reportError()` в ErrorBoundary.
- **Vitest + RTL**: jsdom, setup `src/shared/lib/test/setup.ts`, тесты рядом с кодом (`*.test.ts(x)`).
- **Storybook 10** (`@storybook/react-vite`): `.storybook/main.ts`, `preview.tsx` (index.css + переключатель темы в тулбаре), истории Button, Badge, Island.
- Хуки: `use-form-side-effects`, `use-did-update` удалены; в `use-mount`, `use-search-params` — `eslint-disable` exhaustive-deps с объяснением.
- `docs/frontend.md` переписан под всё это.
- Проверено перед правками пользователя: lint 0/0, typecheck, 25 тестов, build, prettier — зелёные; в браузере на моках пройдены вход (ошибка и успех), восстановление сессии, редирект гостя, регистрация (409 на поле и успех), сброс пароля, выход, доска, настройки, тема.

## 3. Заход по todos.md (2026-11-12, одним заходом по просьбе пользователя, не закоммичено)

Подробно по каждому пункту, с кодом — [session-report.md](session-report.md). Коротко:

- Сборка снова зелёная: `Header` в `landing-layout`, `widgets/app-sidebar` → `widgets/sidebar` (`Sidebar`), роут удалённой `board-page` убран (`BoardLayout` и `ROUTES.BOARD` = `/board/:boardId` ждут холста), импорт `PasswordStrength` в `register-page/model/constants.ts`, пустой `docs/test.ts` удалён.
- `sessionStore` → `authStore` (`auth.store*.ts`), `payload` → `input` в `authService`.
- `cursor: pointer` всем кнопкам — правилом в `index.css` (`@layer base`).
- Без кастов: `PASSWORD_STRENGTHS` в `auth.constants.ts`, тип выводится из неё; `BAR_COLORS: Record<PasswordStrength, string>`.
- **DTO → adapter → модель:** своя модель `User` (`entities/user/model/user.types.ts`), `userAdapter.mapUser` (схема контракта + явные поля), `userSchema` — для сессии из localStorage. `authAdapter` переводит пользователя через `userAdapter`; DTO auth — `AuthResponseDto`/`RefreshResponseDto` в `repository/auth-repository.types.ts`.
- **Формы:** `setFormApiErrors` удалён. Отправка — `useMutation`, ошибки сервера — `useForm({ errors: useFormServerErrors(error, DEFAULT_VALUES, fallback) })` (`shared/lib/hooks`, логика `toFormServerErrors` в `shared/lib/helpers` с тестами). Кнопки — `isPending`. `Form` отправляет непойманные ошибки в `reportError`.
- **Composables с плоскими пропсами:** `UiAlert`, `UiCard`, `UiDialog`, `UiDropdownMenu` (папки с `index.ts` и историями). Новые primitives: `dropdown-menu`, `sheet`.
- **Сайдбар** по `design/dashboard.html`: пространство (мок), поиск (тост), разделы `/boards?view=…`, «Пространство» (Участники/Настройки неактивны, Корзина), квота ИИ (мок), меню пользователя (настройки, уведомления, Telegram — якоря `ROUTES.SETTINGS.build(section)`, тема за флагом `theme`, выход). Телефон — шапка + `Sheet`. В моке бэка флаг `theme: true`.
- `API_BASE_URL` — `baseURL` у `httpClient`, `API_URLS` — пути без префикса, в моках `apiUrl(path)`.
- `Z` → `Z_INDEX`, `emailSchema` → `shared/lib/schemas/email.schema.ts`, из `queryClient` убран лишний `mutations.retry`.
- `eslint.config.mjs`: ошибка `import.meta.dirname` — TS 6 не подключает `@types/*` сам (`types: []` по умолчанию) и в корне не было `@types/node`. Добавлен `@types/node` в корень и `/// <reference types="node" />`.
- Sentry проверен на локальном приёмнике (событие дошло, `environment: mocks`), временный `.env.mocks.local` удалён.
- `cn` — официальный пакет shadcn (`"cn": "0.5.2"`, версия зафиксирована, т.к. 0.x), заменил clsx + tailwind-merge. Импорт везде `import { cn } from 'cn'`; CLI shadcn генерирует так же.
- `docs/frontend.md` обновлён под всё это.

Проверено: lint, typecheck, 30 тестов, build, format:check; в браузере на моках — вход (ошибка/успех), сайдбар десктоп и телефон, меню, тема, выход, регистрация 409, сброс пароля.

## Что дальше

1. Пользователь проверяет заход по [session-report.md](session-report.md) и правит.
2. Задачи из ревью (раздел 23 отчёта): `timeout` у `httpClient`, `queryClient.clear()` при выходе, синхронизация сессии между вкладками, неблокирующий `AppDataLoader`, Sentry release/sourcemaps/setUser, Playwright на моках, тесты форм, чистка неиспользуемого кода шаблона, разделение чанков.
3. Первый `useQuery` — список досок; страница досок начнёт читать `?view=` из сайдбара.
4. Отложено до решения бэка: socket-клиент, OAuth, роли на доске/в воркспейсе (`feat/PRO-8-workspaces-schema`), auth-контракт (`feat/b-01-auth-contract`), nginx и `/ws` (`feat/PRO-7-app-images`), транспорт токенов (сейчас access в localStorage). Эндпоинтов `GET /api/feature-flags` и `POST /api/auth/forgot-password` у бэка нет — только моки.
5. Параллельно запущена отдельная сессия «Перенос дизайна Tandem из HTML в Figma» (переносит `design/` в Figma, код не трогает).

## Проверки

```sh
pnpm --filter @repo/web typecheck
pnpm --filter @repo/web lint
pnpm --filter @repo/web test
pnpm --filter @repo/web build
pnpm format:check
```

Из корня всё сразу: `pnpm turbo run lint typecheck test build --filter=@repo/web`.

Браузер: launch-конфиг `web-mocks` (http://localhost:5174), вход `demo@example.com` / `Demo1234`. Флаг `theme` включается в devtools фича-флагов (шестерёнка справа внизу). Сброс моков — очистить ключи `msw:*` и `session` в localStorage.

Тесты api локально падают с P1000: порт 5432 занят контейнером другого проекта (`edenex-postgres`) — к фронту не относится. Перед запуском api нужен `pnpm --filter @repo/api db:generate`.
