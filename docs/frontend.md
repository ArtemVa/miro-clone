# Фронтенд

`apps/web` — React 19, Vite, TypeScript. Как запустить — [apps/web/README.md](../apps/web/README.md).

- Роутинг — React Router, формы — react-hook-form + zod (`@hookform/resolvers/zod`).
- Серверные данные — TanStack Query, состояние клиента — zustand через `createStore`, запросы — axios (`httpClient`).
- UI — shadcn/ui на Tailwind CSS 4 с токенами Tandem, шрифт Inter, тосты — sonner.
- Моки api — MSW. Тесты — Vitest + Testing Library, витрина — Storybook, ошибки — Sentry (или GlitchTip).

## Переменные окружения

Все необязательные, значения по умолчанию — в `src/shared/config/env/env-schema.ts`, список с описанием — `apps/web/.env.example`. Локально переопределяем в `apps/web/.env.local` (в `.gitignore`).

- Переменные клиента начинаются с `VITE_APP_` и попадают в бандл — секреты туда не кладём.
- Env проверяется схемой и в браузере, и в `vite.config.ts`: с неверным значением `dev` и `build` падают сразу.
- `.env.mocks` включает моки для `dev:mocks`, закоммичен.
- `VITE_APP_SENTRY_DSN` включает мониторинг ошибок. Пусто — выключен, SDK не грузится.
- Новая переменная: `env-schema.ts` → `src/shared/vite-env.d.ts` → `.env.example`.

## Структура

```
src/
  app/        точка входа, роутер, лейауты, глобальные стили, тостер
  pages/      страницы
  widgets/    крупные самостоятельные блоки страницы: сайдбар, шапка
  features/   действия пользователя: создать, отправить, удалить
  entities/   сущности предметной области: пользователь, доска
  core/       сквозные модули приложения: auth, theme, feature-flags
  shared/     код без предметной области: http-клиент, ui-кит, хелперы
  mocks/      MSW: хендлеры и мок-база, только для dev
```

Слой импортирует только из разрешённых слоёв, это проверяет ESLint (`eslint-plugin-boundaries`, карта — `WEB_LAYERS` в корневом `eslint.config.mjs`):

| Слой     | Может импортировать                              |
| -------- | ------------------------------------------------ |
| app      | все слои                                         |
| pages    | pages, widgets, features, entities, core, shared |
| widgets  | widgets, features, entities, core, shared        |
| features | features, entities, core, shared                 |
| entities | entities, core, shared                           |
| core     | core, entities, shared                           |
| shared   | shared                                           |
| mocks    | mocks, shared                                    |

- Модуль (`core/auth`, `entities/user`, `pages/login-page`) отдаёт наружу только то, что экспортирует его `index.ts`: импортируем `@/core/auth`, а не файлы внутри.
- В `shared` модулей нет, импортируем по файлу: `@/shared/api/http-client`.
- Между слоями — алиас `@/`, внутри модуля — относительные пути.
- Имена файлов и папок — kebab-case (проверяет ESLint). Импорты сортирует Prettier: внешние пакеты, `@repo/*`, `@/…` по слоям сверху вниз, относительные.

### Модуль

На примере `core/auth`, у других модулей — только нужные папки.

```
core/auth/
  model/        auth.types.ts      модель фронта
                auth.schema.ts     zod-схемы форм и сессии
                auth.adapter.ts    DTO → модель фронта
                auth.model.ts      чистые функции над моделью
                auth.constants.ts
  repository/   auth.repository.ts         только HTTP
                auth-repository.types.ts   DTO и тип репозитория
  service/      auth.service.ts    бизнес-логика, про стор не знает
  store/        auth.store.ts, auth.store-types.ts, auth.store-selectors.ts
  lib/          auth-interceptor.ts
  ui/           компоненты модуля: GuestRoute, PrivateRoute, Can, …
  index.ts      публичное API
```

Страница: `pages/login-page/login-page.tsx`, фасад `model/use-login-page-facade.ts`, части страницы в `ui/`.

### Поток данных

```
api → repository → adapter → service → store или useQuery → фасад страницы → пассивный UI
```

- **Repository** — только запрос и ответ, типизирован DTO.
- **DTO** — формат api из `@repo/contracts`. Пока контракта нет — тип `*Dto` в `repository/*.types.ts` модуля (сейчас так у auth).
- **Модель фронта** — свой тип в `model/*.types.ts`, даже если поля совпадают с DTO.
- **Adapter** — единственное место, которое знает DTO и модель: проверяет ответ схемой и по полям переводит в модель. Если бэк поменяет формат, упадём здесь, а не в UI. Пример — `entities/user` (`userAdapter.mapUser`), `core/auth` переводит пользователя через него.
- **Service** — repository → adapter. Про стор и UI не знает, тостов не показывает.
- **Store** — состояние клиента и вызов сервиса. Для серверных данных вместо стора — TanStack Query.
- **Фасад** (`pages/*/model/use-*-facade.ts`) — хук, который собирает данные и колбэки для страницы и решает, как показать ошибку.
- **UI** — пассивные компоненты, всё получают через props.

Модули — объекты-синглтоны с прямыми импортами, без классов и DI.

## Запросы к api

- Фронт ходит на свой адрес, CORS не нужен: в dev Vite проксирует `/api` и `/ws` на `VITE_APP_API_PROXY_TARGET` (по умолчанию `http://localhost:3000`), в Docker — nginx.
- `httpClient` (`src/shared/api/http-client.ts`) с `baseURL` = `API_BASE_URL`. Пути — в `API_URLS` (`src/shared/api/constants.ts`) без префикса: `/auth/login`. Моки собирают полный адрес через `apiUrl(path)` из `src/mocks/lib/http.ts`.
- Авторизация (`core/auth/lib/auth-interceptor.ts`): на 401 — один `POST /auth/refresh` на все упавшие запросы и повтор запроса. Если refresh вернул 401, берём токен, который успела обновить другая вкладка (cookie общие), и повторяем один раз; нет токена или повтор снова 401 — выход. Сеть и 5xx на refresh сессию не трогают. При загрузке сессию всегда проверяет сервер: `/me` со своим токеном или refresh по cookie, если сохранённой сессии нет. Выход очищает кэш TanStack Query.
- Ошибка api — контракт `ApiError { code, message, issues? }`: `getApiError`, `getApiErrorMessage`, `getApiErrorStatus`.
- Форма: `useMutation` + `useForm({ errors: useFormServerErrors(error, DEFAULT_VALUES, fallback) })`. `issues` по полям формы — на поля, остальное — в `root` (`UiAlert` над формой). Кнопка смотрит на `isPending`. Пример — `use-login-page-facade.ts`.

## Серверные данные и состояние клиента

- **TanStack Query** — всё, что живёт на сервере. Клиент — `src/shared/api/query-client.ts`: данные свежие 30 секунд, повтор только при 5xx и сетевых ошибках, мутации не повторяются, `refetchOnWindowFocus` включён. Данным, которые обновляет сокет, — `staleTime: Infinity`.
- **zustand** — то, чего нет на сервере: сессия, тема, фича-флаги, состояние интерфейса. Серверные данные в zustand не копируем.
- `queryFn` вызывает сервис модуля. Хук с `useQuery` — в фасаде страницы или в модуле, если нужен нескольким страницам.
- Devtools TanStack Query — в dev в правом нижнем углу, в прод не попадают.

Сторы создаются через `createStore` (`@/shared/lib/helpers/create-store`): vanilla-стор zustand с методом `.use()` для компонентов, экшены — в `actions`, чтение — через селекторы.

```ts
authStore.getState().actions.clearSession(); // вне React
const user = authStore.use(authStoreSelectors.user); // в компоненте
```

## Роуты и лейауты

Пути — `src/shared/routes.ts`, роутер — `src/app/router/`, лейауты — `src/app/layouts/`. Страницы грузятся лениво, каждая экспортирует `Component` из `index.ts`.

| Путь                    | Страница             | Лейаут                              | Доступ   |
| ----------------------- | -------------------- | ----------------------------------- | -------- |
| `/`                     | landing-page         | `LandingLayout` — шапка             | все      |
| `/auth/login`           | login-page           | `AuthLayout` — форма и холст справа | гости    |
| `/auth/register`        | register-page        | `AuthLayout`                        | гости    |
| `/auth/forgot-password` | forgot-password-page | `AuthLayout`                        | гости    |
| `/boards`               | boards-page          | `AppLayout` — сайдбар               | вошедшие |
| `/settings`             | settings-page        | `AppLayout`                         | вошедшие |
| `*`                     | not-found-page       | —                                   | все      |

- `ROUTES.BOARD` (`/board/:boardId`) и `BoardLayout` (холст на весь экран) уже есть, в роутер подключатся вместе со страницей доски.
- Сайдбар — `widgets/sidebar` по `design/dashboard.html`: пространство, поиск, разделы досок (`/boards?view=…`), квота ИИ, меню пользователя. На телефоне — шапка и шторка. Пространства и квота ИИ — моки в `widgets/sidebar/model/constants.ts`, пока нет контракта.
- `GuestRoute` уводит вошедшего к доскам, `PrivateRoute` — гостя на вход и после входа возвращает обратно.
- Глобальных ролей нет. Роли на доске и в воркспейсе придут из контракта воркспейсов, проверка в UI — `Can`.

## UI

```
shared/
  api/          httpClient, queryClient, API_URLS, getApiError
  config/       env/ — схема env; board.ts — константы холста: цвета стикеров, зум, хоткеи
  routes.ts     пути приложения
  services/     toastService
  lib/          hooks, helpers (createStore, form-server-errors, sentry-monitoring),
                utils (guards), types (Simplify, Loadable), schemas (emailSchema), test
  ui/
    primitives/    компоненты shadcn
    composables/   UiCard, UiDialog, UiAlert, UiDropdownMenu, UiPopover, UiHoverCard, UiTooltip,
                   StickyNote, Logo, Island, Loader, Spinner, EmptyState, скелетоны
    control-flow/  Show, List, AsyncWrapper, LoaderGate
    errors/        ErrorPageElement, ErrorAlert, ErrorGate
    form/          Form, InputField, PasswordField, TextareaField, CheckboxField, RadioField, …
```

- В страницах собираем интерфейс из composables с плоскими пропсами (`<UiCard title=… description=…>`), а не из частей shadcn. `primitives/` — внутри composables и там, где фасад не подходит.
- Условный рендер — через `Show`, без `&&` и тернарников в JSX:

  ```tsx
  <Show when={isAuthorized} data={user} fallback={<GuestBadge />}>
    {(user) => <UserAvatar user={user} />}
  </Show>
  ```

- Пропсы, собранные из нескольких типов через `&`, оборачиваем в `Simplify` из `@/shared/lib/types/common`: в подсказках IDE видно итоговый объект, а не цепочку пересечений.
- Классы склеиваем через `cn` из пакета `cn` (официальная замена `clsx` + `tailwind-merge` от shadcn, его же импортирует реестр): `import { cn } from 'cn'`. Версия закреплена точно — пакет 0.x.
- `StickyNote` — только внешний вид стикера (цвет из `STICKY_COLORS`, тень, текст), используется в `AuthLayout` и на лендинге. Стикер на доске: данные — `entities`, редактирование и перетаскивание — `features`, холст — `widgets`, рисуют все этот же `StickyNote`.
- Курсор `pointer` у кнопок задан в `index.css` (`@layer base`): Tailwind 4 его не ставит.

### Дизайн-токены

CSS-переменные в `src/app/styles/index.css` (`:root` и `.dark`), Tailwind видит их через `@theme inline`. Источник — `design/` и handoff дизайнера.

- Цвета: `primary`, `ai` (только ИИ-действия), `success`, `warning`, `destructive`, `canvas`, `sticky-*`, `presence-1…8`.
- Тени: `shadow-island`, `shadow-pop`, `shadow-sticky`. Утилиты: `island`, `canvas-dots`, `sticky-note`, `shimmer`, `scrollbar-thin`.
- В компонентах — только токены (`bg-primary`, `text-muted-foreground`), без hex и `bg-indigo-500`.

### Компоненты shadcn

Лежат в `src/shared/ui/primitives`, пути CLI — в `components.json`.

```sh
pnpm --filter @repo/web add:ui dialog
pnpm --filter @repo/web add:hook useBoolean   # хуки reactuse, пути — в reactuse.json
```

Если CLI спрашивает, перезаписать ли файл, отвечаем N — иначе пропадут наши правки.

## Моки (MSW)

Фронт делает интерфейс на моках, пока бэк делает эндпоинт (см. [contracts-and-review.md](contracts-and-review.md)).

- Хендлеры — `src/mocks/handlers`, по файлу на модуль, подключаются в `handlers/index.ts`, мокают те же адреса из `API_URLS`.
- Мок-база — `src/mocks/db.ts`, хранится в localStorage (сброс — удалить ключи `msw:*`). Демо-аккаунт: `demo@example.com` / `Demo1234`.
- Включаются только при `VITE_APP_API_MOCKS=true`, в прод-бандл не попадают.
- `public/mockServiceWorker.js` обновляем вместе с версией `msw`: `pnpm --filter @repo/web exec msw init public`.

## Фича-флаги

- Приходят с api (`GET /api/feature-flags`). При ошибке — значения по умолчанию без тоста: пользователь ничего не может с ней сделать.
- В dev в правом нижнем углу — devtools с локальными переопределениями (localStorage, в проде не работают).
- В компоненте: `featureFlagsStore.use(featureFlagsStoreSelectors.isEnabled('theme'))`.
- Новый флаг: `FEATURE_FLAG_NAMES` и `DEFAULT_FEATURE_FLAGS` в `core/feature-flags/model/feature-flags.constants.ts`, затем мок.

Тёмная тема спрятана за флагом `theme`.

## Тесты и Storybook

- Vitest с jsdom, конфиг — секция `test` в `vite.config.ts`, настройка — `src/shared/lib/test/setup.ts`. Тест рядом с кодом: `auth.model.ts` → `auth.model.test.ts`.
- Тестируем чистые функции модели и поведение компонентов глазами пользователя (`getByRole`, `getByLabelText`), без проверки классов и внутреннего состояния. Компонент страницы — без фасада: своя обёртка с `useForm`, колбэк — `vi.fn()`.
- Storybook — `apps/web/.storybook`, берёт `vite.config.ts` приложения. Истории — `*.stories.tsx` рядом с компонентом, в тулбаре переключается тема.

## Мониторинг ошибок

`src/shared/lib/helpers/sentry-monitoring.ts`. SDK подключается, только если задан `VITE_APP_SENTRY_DSN`, и грузится отдельным чанком. GlitchTip принимает тот же SDK — достаточно сменить DSN.

- `initMonitoring()` вызывается в `main.tsx` до рендера. Не загрузился SDK — приложение работает без него.
- `reportError(error)` — для ошибок, пойманных самими (ErrorBoundary, необработанная ошибка в `onSubmit`): в dev — в консоль, в мониторинг — если включён.
- Проверить без аккаунта Sentry: `apps/web/.env.mocks.local` с `VITE_APP_SENTRY_DSN=http://key@localhost:5173/1` и `VITE_APP_API_PROXY_TARGET` на локальный приёмник — SDK шлёт на `/api/1/envelope/`, Vite проксирует туда.
