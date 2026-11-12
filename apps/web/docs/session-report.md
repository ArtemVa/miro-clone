# Отчёт по todos.md — 2026-11-12

По каждому пункту из [todos.md](todos.md): что сделано, почему так, и итоговый код (вставлен из файлов как есть). Ничего не закоммичено.

**Проверки после всех правок:** `pnpm turbo run lint typecheck test build --filter=@repo/web` — 5/5 зелёные, 30 тестов в 6 файлах. `pnpm format:check` зелёный. В браузере на моках (`web-mocks`) проверено: вход с неверным паролем (алерт над формой) и успешный, сайдбар на десктопе и на телефоне (шторка открывается и закрывается после перехода), меню пользователя (тема, Telegram-бот → `/settings#telegram`, выход), активный раздел `/boards?view=starred`, регистрация с занятым email (ошибка на поле, фокус на поле), сброс пароля и повторная отправка (тост). В консоли только ожидаемые ответы 401/409.

**Что я решил сам, без тебя** (пункты, которые раньше были вопросами):

- `pages/board-page` ты удалил, поэтому роут доски убрал из `private.routes.tsx`, а кнопку «Открыть демо-доску» — со страницы досок (она вела бы на 404). `BoardLayout` и `ROUTES.BOARD` оставил: вернутся вместе с холстом.
- `apps/web/docs/test.ts` был пустым (0 байт) — удалил, ESLint на нём падал.
- Флаг `theme` в моке бэка (`mocks/handlers/feature-flags.handlers.ts`) включил, чтобы пункт «Сменить тему» был виден в меню. Значение по умолчанию (`DEFAULT_FEATURE_FLAGS`) осталось `false`.
- Prettier (`format:check` в CI) поправил форматирование в нескольких твоих файлах: только пробелы и переводы строк (`todos.md`, `feature-flags.model.ts`, `landing-page/model/constants.ts`, `index.ts` у button/badge/island, `password-strength.tsx`).

**Поправка (следующий заход):** раньше здесь было написано, что CLI shadcn «ошибочно» поставил стороннюю библиотеку `cn`. Это неверно: `cn` — официальный пакет shadcn (shadcn-ui/cn), он заменяет связку clsx + tailwind-merge, и новые компоненты реестра импортируют `{ cn } from 'cn'`. Теперь проект целиком на нём: `"cn": "0.5.2"` (точная версия), `clsx`/`tailwind-merge` и `shared/lib/utils/cn.ts` удалены, во всём коде `import { cn } from 'cn'`. В примерах ниже старый импорт `@/shared/lib/utils` оставлен как было на момент отчёта.

---

## 1. sessionStore → authStore

Переименовал стор, селекторы и типы: `authStore`, `authStoreSelectors`, `AuthStoreSlice`, `AuthState`, `AuthActions`. Файлы — `core/auth/store/auth.store.ts`, `auth.store-types.ts`, `auth.store-selectors.ts`. Поле `session` внутри стора и ключ localStorage `'session'` оставил: это действительно сессия, а смена ключа разлогинила бы всех. Все места использования и `docs/frontend.md` обновлены.

`apps/web/src/core/auth/store/auth.store.ts`

```ts
import { persist } from 'zustand/middleware';

import { createStore } from '@/shared/lib/helpers/create-store';

import { SESSION_STORAGE_KEY } from '../model/auth.constants';
import { authModel } from '../model/auth.model';
import { authService } from '../service/auth.service';
import type { AuthStoreSlice } from './auth.store-types';

export const authStore = createStore<AuthStoreSlice>()(
  persist(
    (set, get) => ({
      session: null,
      actions: {
        signIn: async (input) => {
          set({ session: await authService.signIn(input) });
        },

        register: async (input) => {
          set({ session: await authService.register(input) });
        },

        signOut: async () => {
          await authService.signOut();
          set({ session: null });
        },

        restoreSession: async () => {
          if (!get().session) return;

          const user = await authService.getMe();
          set((state) => (state.session ? { session: { ...state.session, user } } : state));
        },

        refreshToken: async () => {
          const accessToken = await authService.refreshToken();
          set((state) => (state.session ? { session: { ...state.session, accessToken } } : state));

          return accessToken;
        },

        clearSession: () => set({ session: null }),
      },
    }),
    {
      name: SESSION_STORAGE_KEY,
      partialize: (state) => ({ session: state.session }),
      merge: (persisted, current) => ({
        ...current,
        session: authModel.getPersistedSession(persisted),
      }),
    },
  ),
);
```

`apps/web/src/core/auth/store/auth.store-types.ts`

```ts
import type { Simplify } from '@/shared/lib/types/common';

import type { LoginInput, RegisterInput, Session } from '../model/auth.types';

export type AuthStoreSlice = Simplify<AuthState & AuthActions>;

export type AuthState = {
  session: Session | null;
};

export type AuthActions = {
  actions: {
    signIn: (input: LoginInput) => Promise<void>;
    register: (input: RegisterInput) => Promise<void>;
    signOut: () => Promise<void>;
    restoreSession: () => Promise<void>;
    refreshToken: () => Promise<string>;
    clearSession: () => void;
  };
};
```

`apps/web/src/core/auth/store/auth.store-selectors.ts`

```ts
import type { AuthStoreSlice } from './auth.store-types';

export const authStoreSelectors = {
  session: (state: AuthStoreSlice) => state.session,
  isAuthorized: (state: AuthStoreSlice) => state.session !== null,
  user: (state: AuthStoreSlice) => state.session?.user,
  accessToken: (state: AuthStoreSlice) => state.session?.accessToken,
  actions: (state: AuthStoreSlice) => state.actions,
};
```

`apps/web/src/core/auth/index.ts`

```ts
export type { ForgotPasswordInput, LoginInput, PasswordStrength, RegisterInput, Session } from './model/auth.types';
export {
  forgotPasswordFormSchema,
  loginFormSchema,
  registerFormSchema,
  type ForgotPasswordFormValues,
  type LoginFormValues,
  type RegisterFormValues,
} from './model/auth.schema';
export { authModel } from './model/auth.model';

export { authService } from './service/auth.service';

export { authStore } from './store/auth.store';
export { authStoreSelectors } from './store/auth.store-selectors';

export { setupAuthInterceptors } from './lib/auth-interceptor';

export { PrivateRoute } from './ui/private-route';
export { GuestRoute } from './ui/guest-route';
export { AuthFormLayout } from './ui/auth-form-layout';
export { AuthLink } from './ui/auth-link';
export { Can } from './ui/can';
```

## 2. payload → input

В `auth.service.ts` у `signIn`, `register`, `requestPasswordReset`. В моках `payload` остался только в `mocks/lib/tokens.ts`: там это payload токена, общепринятый термин.

`apps/web/src/core/auth/service/auth.service.ts`

```ts
import { userAdapter, type User } from '@/entities/user';

import { authAdapter } from '../model/auth.adapter';
import type { ForgotPasswordInput, LoginInput, RegisterInput, Session } from '../model/auth.types';
import { authRepository } from '../repository/auth.repository';

export const authService = {
  async signIn(input: LoginInput): Promise<Session> {
    const { data } = await authRepository.login({ params: input });
    return authAdapter.mapSession(data);
  },

  async register(input: RegisterInput): Promise<Session> {
    const { data } = await authRepository.register({ params: input });
    return authAdapter.mapSession(data);
  },

  async signOut(): Promise<void> {
    await authRepository.logout().catch(() => undefined);
  },

  async getMe(): Promise<User> {
    const { data } = await authRepository.me();
    return userAdapter.mapUser(data);
  },

  async refreshToken(): Promise<string> {
    const { data } = await authRepository.refresh();
    return authAdapter.mapAccessToken(data);
  },

  async requestPasswordReset(input: ForgotPasswordInput): Promise<void> {
    await authRepository.forgotPassword({ params: input });
  },
};
```

## 3. cursor-pointer для всех кнопок

Сделал одним правилом в `index.css` (`@layer base`), а не классом в `Button`. Tailwind 4 убрал `cursor: pointer` у кнопок, и правило в базе покрывает сразу всё: `Button`, триггеры radix (меню, поповеры, закрытие диалога), обычные `<button>` в виджетах. С классом в `Button` пришлось бы дописывать его в каждый такой триггер. Так же советует гайд миграции Tailwind 4.

```css
/* apps/web/src/app/styles/index.css, внутри @layer base */
/* Tailwind 4 оставляет кнопкам курсор браузера (default). Pointer — всем кнопкам сразу: Button, триггерам radix, своим <button> */
button:not(:disabled),
[role='button']:not([aria-disabled='true']) {
  cursor: pointer;
}
```

## 4 и 15. Касты в getPasswordStrength и BAR_COLORS

Источник обоих кастов один: тип `0 | 1 | 2 | 3 | 4` был описан отдельно от логики.

- Уровни теперь — константа `PASSWORD_STRENGTHS = [0, 1, 2, 3, 4] as const`, тип выводится из неё. `getPasswordStrength` берёт уровень из массива по числу пройденных проверок, без `as`. Проверок 4, уровней 5 (с нулём) — это записано в комментарии к константе.
- `BAR_COLORS` теперь `Record<PasswordStrength, string>` с ключом `0` (цвет пустой полоски). Поэтому `BAR_COLORS[strength]` типобезопасен без `Exclude`, а проверка `strength > 0` не нужна: при 0 условие `step <= strength` ложно для всех полосок.

`apps/web/src/core/auth/model/auth.constants.ts`

```ts
export const SESSION_STORAGE_KEY = 'session';

/** Уровни сложности пароля: 0 — пусто, 4 — отличный. Уровень = число выполненных проверок в getPasswordStrength */
export const PASSWORD_STRENGTHS = [0, 1, 2, 3, 4] as const;
```

`apps/web/src/core/auth/model/auth.types.ts`

```ts
import type { User } from '@/entities/user';

import type { PASSWORD_STRENGTHS } from './auth.constants';

/* ----- MODEL FOR FRONTEND ----- */

export type Session = {
  user: User;
  accessToken: string;
};

/** Сложность пароля для индикатора под полем: 0 — пусто, 4 — отличный */
export type PasswordStrength = (typeof PASSWORD_STRENGTHS)[number];

/* ----- UI TYPES ----- */

export type LoginInput = {
  email: string;
  password: string;
};

export type RegisterInput = {
  name: string;
  email: string;
  password: string;
};

export type ForgotPasswordInput = {
  email: string;
};
```

`apps/web/src/core/auth/model/auth.model.ts`

```ts
import { z } from 'zod';

import { PASSWORD_STRENGTHS } from './auth.constants';
import { sessionSchema } from './auth.schema';
import type { PasswordStrength, Session } from './auth.types';

export const authModel = {
  getPersistedSession: (persisted: unknown): Session | null => {
    const result = z.object({ session: sessionSchema }).safeParse(persisted);
    return result.success ? result.data.session : null;
  },

  getRedirectPath: (locationState: unknown): string | undefined => {
    if (typeof locationState !== 'object' || locationState === null || !('from' in locationState)) {
      return undefined;
    }

    const { from } = locationState;

    return typeof from === 'object' && from !== null && 'pathname' in from && typeof from.pathname === 'string'
      ? from.pathname
      : undefined;
  },

  getPasswordStrength: (password: string): PasswordStrength => {
    const checks = [
      password.length >= 8,
      /\d/.test(password),
      /[A-ZА-ЯЁ]/.test(password) && /[a-zа-яё]/.test(password),
      password.length >= 12 || /[^\p{L}\d]/u.test(password),
    ];

    return password ? PASSWORD_STRENGTHS[checks.filter(Boolean).length] : 0;
  },
};
```

`apps/web/src/pages/register-page/model/constants.ts`

```ts
import type { PasswordStrength } from '@/core/auth';

export const STRENGTH_STEPS = [1, 2, 3, 4] as const;

// У 0 нет закрашенных полосок, цвет для него совпадает с пустой полоской
export const BAR_COLORS: Record<PasswordStrength, string> = {
  0: 'bg-muted',
  1: 'bg-destructive',
  2: 'bg-warning',
  3: 'bg-primary',
  4: 'bg-success',
};

export const HINTS: Record<PasswordStrength, string> = {
  0: 'Минимум 8 символов, лучше с цифрами и разным регистром',
  1: 'Слишком простой',
  2: 'Можно лучше',
  3: 'Хороший пароль',
  4: 'Отличный пароль',
};
```

`apps/web/src/pages/register-page/ui/password-strength.tsx`

```tsx
import type { PasswordStrength as Strength } from '@/core/auth';
import { cn } from '@/shared/lib/utils';

import { BAR_COLORS, HINTS, STRENGTH_STEPS } from '../model/constants';

type PasswordStrengthProps = {
  strength: Strength;
};

export const PasswordStrength = ({ strength }: PasswordStrengthProps) => (
  <span className="flex flex-col gap-1.5">
    <span className="flex gap-1" aria-hidden="true">
      {STRENGTH_STEPS.map((step) => (
        <span
          key={step}
          className={cn('h-1 flex-1 rounded-full bg-muted transition-colors', step <= strength && BAR_COLORS[strength])}
        />
      ))}
    </span>
    <span>{HINTS[strength]}</span>
  </span>
);
```

## 5. Сайдбар по дизайну, меню пользователя

Сделал по `design/dashboard.html`, сверху вниз:

1. Переключатель пространства (меню со списком, «Создать», «Настройки пространства»).
2. Поиск с `⌘K` (пока показывает тост: поиска досок ещё нет).
3. Разделы досок: Все / Недавние / Избранное / Общие со мной. Это ссылки `/boards?view=…`, активный подсвечивается.
4. Блок «Пространство»: «Участники» и «Настройки» неактивны (страниц нет), «Корзина» ведёт на `?view=trash`.
5. Квота ИИ.
6. Пользователь: аватар цвета presence, имя, email. По клику открывается меню: «Профиль и настройки», «Уведомления», «Telegram-бот», «Сменить тему» (за флагом `theme`), «Выйти».

На телефоне — шапка с кнопкой меню и шторка слева (`Sheet`). Шторка закрывается сама после перехода: её открытое состояние привязано к `location.key`, без `useEffect`. Пространства и квота ИИ — моки в `sidebar.constants.ts`, помечены `shortcut:` (контракта воркспейсов и лимитов ИИ у бэка нет). Страница досок параметр `view` пока не читает — заработает вместе со списком досок.

Для якорей из меню добавил `ROUTES.SETTINGS.SECTIONS` и `build(section)`. На странице настроек появились карточки «Уведомления» и «Telegram-бот» со статусом «Скоро», и прокрутка к якорю (React Router сам к якорю не прокручивает). `UserAvatar` в `entities/user` стал обычным аватаром с цветом пользователя (`userModel.getAvatarColor`), `UserInfo` принимает `user`.

`apps/web/src/widgets/sidebar/sidebar.tsx`

```tsx
import { MenuIcon, SearchIcon } from 'lucide-react';

import { ThemeSwitch } from '@/widgets/theme-switch';
import { Show } from '@/shared/ui/control-flow/show';
import { Button } from '@/shared/ui/primitives/button';
import { Sheet, SheetContent, SheetDescription, SheetTitle } from '@/shared/ui/primitives/sheet';

import { BOARDS_NAV, MOCK_AI_QUOTA, WORKSPACE_NAV } from './model/sidebar.constants';
import { useSidebarFacade } from './model/use-sidebar-facade';
import { AiQuotaCard } from './ui/ai-quota-card';
import { SidebarNav } from './ui/sidebar-nav';
import { UserMenu } from './ui/user-menu';
import { WorkspaceSwitcher } from './ui/workspace-switcher';

type SidebarContentProps = ReturnType<typeof useSidebarFacade>;

/** Содержимое панели по design/dashboard.html: пространство, поиск, разделы досок, пространство, квота ИИ, пользователь */
const SidebarContent = ({
  user,
  workspace,
  workspaces,
  activeView,
  theme,
  isThemeEnabled,
  selectWorkspace,
  toggleTheme,
  signOut,
  handleSearch,
}: SidebarContentProps) => (
  <div className="flex h-full flex-col">
    <div className="p-3">
      <Show when={!!workspace} data={workspace}>
        {(workspace) => <WorkspaceSwitcher workspace={workspace} workspaces={workspaces} onSelect={selectWorkspace} />}
      </Show>
    </div>

    <div className="px-3">
      <button
        type="button"
        onClick={handleSearch}
        className="flex h-8 w-full items-center gap-2 rounded-md border bg-background px-2.5 text-sm text-muted-foreground hover:border-foreground/20"
      >
        <SearchIcon className="size-4" />
        Поиск
        <kbd className="ml-auto rounded border bg-muted px-1.5 font-sans text-[11px]">⌘K</kbd>
      </button>
    </div>

    <SidebarNav label="Доски" items={BOARDS_NAV} activeView={activeView} className="mt-4 px-3" />

    <p className="mt-6 mb-1 px-6 text-[11px] font-medium tracking-wider text-muted-foreground uppercase">
      Пространство
    </p>
    <SidebarNav label="Пространство" items={WORKSPACE_NAV} activeView={activeView} className="px-3" />

    <div className="mt-auto flex flex-col gap-3 p-3">
      <AiQuotaCard {...MOCK_AI_QUOTA} />
      <Show when={!!user} data={user}>
        {(user) => (
          <UserMenu
            user={user}
            theme={theme}
            isThemeEnabled={isThemeEnabled}
            onToggleTheme={toggleTheme}
            onSignOut={signOut}
          />
        )}
      </Show>
    </div>
  </div>
);

export const Sidebar = () => {
  const sidebar = useSidebarFacade();

  return (
    <>
      {/* Телефон и планшет: шапка с кнопкой меню, панель — шторкой слева */}
      <header className="sticky top-0 z-30 flex h-14 shrink-0 items-center gap-2 border-b bg-background/85 px-4 backdrop-blur lg:hidden">
        <Button variant="ghost" size="icon-sm" aria-label="Открыть меню" onClick={() => sidebar.setIsMobileOpen(true)}>
          <MenuIcon />
        </Button>
        <span className="truncate text-sm font-medium">{sidebar.workspace?.name}</span>
        <div className="ml-auto">
          <ThemeSwitch />
        </div>
      </header>

      <Sheet open={sidebar.isMobileOpen} onOpenChange={sidebar.setIsMobileOpen}>
        <SheetContent side="left" className="w-64 gap-0 p-0 sm:max-w-64" showCloseButton={false}>
          <SheetTitle className="sr-only">Меню</SheetTitle>
          <SheetDescription className="sr-only">Пространство, разделы досок и меню пользователя</SheetDescription>
          <SidebarContent {...sidebar} />
        </SheetContent>
      </Sheet>

      {/* Десктоп: панель всегда видна */}
      <aside className="hidden w-64 shrink-0 border-r bg-muted/30 lg:block">
        <SidebarContent {...sidebar} />
      </aside>
    </>
  );
};
```

`apps/web/src/widgets/sidebar/model/use-sidebar-facade.ts`

```ts
import { useState } from 'react';
import { useLocation } from 'react-router';

import { authStore, authStoreSelectors } from '@/core/auth';
import { featureFlagsStore, featureFlagsStoreSelectors } from '@/core/feature-flags';
import { themeStore, themeStoreSelectors } from '@/core/theme';
import { ROUTES } from '@/shared/routes';
import { toastService } from '@/shared/services/toast/service';

import { BOARDS_VIEWS, MOCK_WORKSPACES } from './sidebar.constants';

export const useSidebarFacade = () => {
  const user = authStore.use(authStoreSelectors.user);
  const { signOut } = authStore.use(authStoreSelectors.actions);

  const isThemeEnabled = featureFlagsStore.use(featureFlagsStoreSelectors.isEnabled('theme'));
  const theme = themeStore.use(themeStoreSelectors.theme);
  const { toggleTheme } = themeStore.use(themeStoreSelectors.actions);

  // shortcut: выбранное пространство живёт до перезагрузки, пока пространства — моки
  const [workspaceId, setWorkspaceId] = useState(MOCK_WORKSPACES[0]?.id);
  const workspace = MOCK_WORKSPACES.find(({ id }) => id === workspaceId);

  const location = useLocation();
  const viewParam = new URLSearchParams(location.search).get('view');
  const activeView =
    location.pathname === ROUTES.BOARDS.path ? (BOARDS_VIEWS.find((view) => view === viewParam) ?? 'all') : null;

  // Шторка открыта только на той записи истории, где её открыли: переход по ссылке закрывает её сам, без эффекта
  const [mobileOpenAt, setMobileOpenAt] = useState<string | null>(null);
  const isMobileOpen = mobileOpenAt === location.key;
  const setIsMobileOpen = (open: boolean) => setMobileOpenAt(open ? location.key : null);

  const handleSearch = () => toastService.showInfo('Поиск по доскам появится вместе со списком досок');

  return {
    user,
    workspace,
    workspaces: MOCK_WORKSPACES,
    activeView,
    isThemeEnabled,
    theme,
    isMobileOpen,
    setIsMobileOpen,
    selectWorkspace: setWorkspaceId,
    toggleTheme,
    signOut: () => void signOut(),
    handleSearch,
  };
};
```

`apps/web/src/widgets/sidebar/model/sidebar.constants.ts`

```ts
import {
  ClockIcon,
  LayoutGridIcon,
  Settings2Icon,
  StarIcon,
  Trash2Icon,
  UserPlusIcon,
  UsersIcon,
  type LucideIcon,
} from 'lucide-react';

import { ROUTES } from '@/shared/routes';

/** Разделы списка досок: /boards?view=… */
export const BOARDS_VIEWS = ['all', 'recent', 'starred', 'shared', 'trash'] as const;
export type BoardsView = (typeof BOARDS_VIEWS)[number];

export type SidebarNavItem = {
  label: string;
  icon: LucideIcon;
} & ({ view: BoardsView } | { disabled: true });

export const boardsViewPath = (view: BoardsView) =>
  view === 'all' ? ROUTES.BOARDS.path : `${ROUTES.BOARDS.path}?view=${view}`;

export const BOARDS_NAV: SidebarNavItem[] = [
  { view: 'all', label: 'Все доски', icon: LayoutGridIcon },
  { view: 'recent', label: 'Недавние', icon: ClockIcon },
  { view: 'starred', label: 'Избранное', icon: StarIcon },
  { view: 'shared', label: 'Общие со мной', icon: UsersIcon },
];

// Страниц пространства пока нет: пункты видны, но неактивны
export const WORKSPACE_NAV: SidebarNavItem[] = [
  { label: 'Участники', icon: UserPlusIcon, disabled: true },
  { label: 'Настройки', icon: Settings2Icon, disabled: true },
  { view: 'trash', label: 'Корзина', icon: Trash2Icon },
];

/* shortcut: пространства и квота ИИ — моки, пока у бэка нет контракта воркспейсов (feat/PRO-8-workspaces-schema) и лимитов ИИ.
   Когда появятся эндпоинты — useQuery в фасаде сайдбара вместо этих констант */

export type Workspace = {
  id: string;
  name: string;
  membersCount: number;
  color: string;
};

export const MOCK_WORKSPACES: Workspace[] = [
  { id: 'product', name: 'Продуктовая команда', membersCount: 8, color: 'var(--primary)' },
  { id: 'design', name: 'Дизайн', membersCount: 4, color: 'var(--presence-2)' },
  { id: 'personal', name: 'Личное', membersCount: 1, color: 'var(--presence-1)' },
];

export const MOCK_AI_QUOTA = {
  used: 34,
  limit: 100,
  resetsAt: '1 декабря',
};
```

`apps/web/src/widgets/sidebar/ui/sidebar-nav.tsx`

```tsx
import { Link } from 'react-router';

import { cn } from '@/shared/lib/utils';

import { boardsViewPath, type BoardsView, type SidebarNavItem } from '../model/sidebar.constants';

const ITEM_CLASS =
  'flex h-8 w-full items-center gap-2.5 rounded-md px-2.5 text-[13px] text-muted-foreground transition-colors [&_svg]:size-4';

type SidebarNavEntryProps = {
  item: SidebarNavItem;
  activeView: BoardsView | null;
};

const SidebarNavEntry = ({ item, activeView }: SidebarNavEntryProps) => {
  if (!('view' in item)) {
    return (
      <span aria-disabled="true" title="Скоро" className={cn(ITEM_CLASS, 'cursor-not-allowed opacity-50')}>
        <item.icon />
        {item.label}
      </span>
    );
  }

  return (
    <Link
      to={boardsViewPath(item.view)}
      aria-current={item.view === activeView ? 'page' : undefined}
      className={cn(
        ITEM_CLASS,
        'hover:bg-accent hover:text-foreground aria-[current=page]:bg-accent aria-[current=page]:font-medium aria-[current=page]:text-foreground',
      )}
    >
      <item.icon />
      {item.label}
    </Link>
  );
};

type SidebarNavProps = {
  label: string;
  items: SidebarNavItem[];
  activeView: BoardsView | null;
  className?: string;
};

export const SidebarNav = ({ label, items, activeView, className }: SidebarNavProps) => (
  <nav aria-label={label} className={className}>
    <ul className="flex flex-col gap-0.5">
      {items.map((item) => (
        <li key={item.label}>
          <SidebarNavEntry item={item} activeView={activeView} />
        </li>
      ))}
    </ul>
  </nav>
);
```

`apps/web/src/widgets/sidebar/ui/user-menu.tsx`

```tsx
import { BellIcon, ChevronsUpDownIcon, LogOutIcon, MoonIcon, SendIcon, SunIcon, UserRoundIcon } from 'lucide-react';

import { UserInfo, type User } from '@/entities/user';
import type { Theme } from '@/core/theme';
import { ROUTES } from '@/shared/routes';
import { UiDropdownMenu, type UiMenuItem } from '@/shared/ui/composables/ui-dropdown-menu';

type UserMenuProps = {
  user: User;
  theme: Theme;
  isThemeEnabled: boolean;
  onToggleTheme: () => void;
  onSignOut: () => void;
};

const { SECTIONS } = ROUTES.SETTINGS;

/** Меню по клику на пользователя внизу сайдбара (design/dashboard.html, #userMenu) */
export const UserMenu = ({ user, theme, isThemeEnabled, onToggleTheme, onSignOut }: UserMenuProps) => {
  const themeItem: UiMenuItem = {
    label: theme === 'dark' ? 'Светлая тема' : 'Тёмная тема',
    icon: theme === 'dark' ? <SunIcon /> : <MoonIcon />,
    onSelect: onToggleTheme,
  };

  const items: UiMenuItem[] = [
    { label: 'Профиль и настройки', icon: <UserRoundIcon />, to: ROUTES.SETTINGS.path },
    { label: 'Уведомления', icon: <BellIcon />, to: ROUTES.SETTINGS.build(SECTIONS.NOTIFICATIONS) },
    { label: 'Telegram-бот', icon: <SendIcon />, to: ROUTES.SETTINGS.build(SECTIONS.TELEGRAM) },
    // Тёмная тема пока за фича-флагом theme
    ...(isThemeEnabled ? [themeItem] : []),
    { type: 'separator' },
    { label: 'Выйти', icon: <LogOutIcon />, onSelect: onSignOut },
  ];

  return (
    <UiDropdownMenu
      side="top"
      align="start"
      contentClassName="w-(--radix-dropdown-menu-trigger-width)"
      items={items}
      trigger={
        <button
          type="button"
          aria-label={`Меню пользователя ${user.name}`}
          className="flex w-full items-center gap-2 rounded-lg p-1.5 hover:bg-accent data-[state=open]:bg-accent"
        >
          <UserInfo user={user} className="flex-1" />
          <ChevronsUpDownIcon className="size-4 shrink-0 text-muted-foreground" />
        </button>
      }
    />
  );
};
```

`apps/web/src/widgets/sidebar/ui/workspace-switcher.tsx`

```tsx
import { CheckIcon, ChevronsUpDownIcon, PlusIcon, SettingsIcon } from 'lucide-react';

import { cn } from '@/shared/lib/utils';
import { UiDropdownMenu, type UiMenuItem } from '@/shared/ui/composables/ui-dropdown-menu';
import { Show } from '@/shared/ui/control-flow/show';

import type { Workspace } from '../model/sidebar.constants';

type WorkspaceSwitcherProps = {
  workspace: Workspace;
  workspaces: Workspace[];
  onSelect: (id: string) => void;
};

type WorkspaceMarkProps = {
  workspace: Workspace;
  className: string;
};

const WorkspaceMark = ({ workspace, className }: WorkspaceMarkProps) => (
  <span
    className={cn('flex shrink-0 items-center justify-center font-semibold text-white', className)}
    style={{ backgroundColor: workspace.color }}
    aria-hidden="true"
  >
    {workspace.name[0]}
  </span>
);

export const WorkspaceSwitcher = ({ workspace, workspaces, onSelect }: WorkspaceSwitcherProps) => {
  const items: UiMenuItem[] = [
    { type: 'label', label: 'Пространства' },
    ...workspaces.map((item): UiMenuItem => ({
      label: (
        <>
          <WorkspaceMark workspace={item} className="size-5 rounded text-[10px]" />
          <span className="truncate">{item.name}</span>
          <Show when={item.id === workspace.id}>
            <CheckIcon className="ml-auto text-foreground" />
          </Show>
        </>
      ),
      onSelect: () => onSelect(item.id),
    })),
    { type: 'separator' },
    { label: 'Создать пространство', icon: <PlusIcon />, disabled: true },
    { label: 'Настройки пространства', icon: <SettingsIcon />, disabled: true },
  ];

  return (
    <UiDropdownMenu
      align="start"
      contentClassName="w-(--radix-dropdown-menu-trigger-width)"
      items={items}
      trigger={
        <button type="button" className="flex w-full items-center gap-2.5 rounded-lg p-1.5 text-left hover:bg-accent">
          <WorkspaceMark workspace={workspace} className="size-8 rounded-lg text-sm" />
          <span className="min-w-0 flex-1">
            <span className="block truncate text-sm font-medium">{workspace.name}</span>
            <span className="block text-xs text-muted-foreground">Участников: {workspace.membersCount}</span>
          </span>
          <ChevronsUpDownIcon className="size-4 text-muted-foreground" />
        </button>
      }
    />
  );
};
```

`apps/web/src/widgets/sidebar/ui/ai-quota-card.tsx`

```tsx
import { SparklesIcon } from 'lucide-react';

type AiQuotaCardProps = {
  used: number;
  limit: number;
  resetsAt: string;
};

export const AiQuotaCard = ({ used, limit, resetsAt }: AiQuotaCardProps) => (
  <div className="rounded-lg border bg-background p-3">
    <div className="flex items-center gap-2 text-xs">
      <SparklesIcon className="size-4 text-ai" />
      <span className="font-medium">ИИ-запросы</span>
      <span className="ml-auto text-muted-foreground">
        {used} / {limit}
      </span>
    </div>
    <div
      role="progressbar"
      aria-label="Использовано ИИ-запросов"
      aria-valuenow={used}
      aria-valuemin={0}
      aria-valuemax={limit}
      className="mt-2 h-1.5 overflow-hidden rounded-full bg-muted"
    >
      <div className="h-full rounded-full bg-ai" style={{ width: `${Math.min(used / limit, 1) * 100}%` }} />
    </div>
    <p className="mt-1.5 text-[11px] text-muted-foreground">Обновится {resetsAt}</p>
  </div>
);
```

`apps/web/src/widgets/sidebar/index.ts`

```ts
export { Sidebar } from './sidebar';
```

`apps/web/src/app/layouts/app-layout.tsx`

```tsx
import { Outlet } from 'react-router';

import { Sidebar } from '@/widgets/sidebar';

/** Сайдбар слева на десктопе, шапка с меню-шторкой на телефоне. Прокручивается только main */
export const AppLayout = () => (
  <div className="flex h-dvh flex-col lg:flex-row">
    <Sidebar />
    <main className="scrollbar-thin min-w-0 flex-1 overflow-y-auto">
      <Outlet />
    </main>
  </div>
);
```

`apps/web/src/entities/user/ui/user-avatar.tsx`

```tsx
import type { ComponentProps } from 'react';

import { Avatar, AvatarFallback } from '@/shared/ui/primitives/avatar';

import { userModel } from '../model/user.model';
import type { User } from '../model/user.types';

type UserAvatarProps = {
  user: Pick<User, 'id' | 'name'>;
  className?: string;
} & Pick<ComponentProps<typeof Avatar>, 'size'>;

/** Инициалы на цвете пользователя (как .avatar в design/). Декоративный: имя рядом пишут текстом */
export const UserAvatar = ({ user, size, className }: UserAvatarProps) => (
  <Avatar size={size} className={className} aria-hidden="true">
    <AvatarFallback className="font-semibold text-white" style={{ backgroundColor: userModel.getAvatarColor(user) }}>
      {userModel.getInitials(user)}
    </AvatarFallback>
  </Avatar>
);
```

`apps/web/src/entities/user/ui/user-info.tsx`

```tsx
import { cn } from '@/shared/lib/utils';

import type { User } from '../model/user.types';
import { UserAvatar } from './user-avatar';

type UserInfoProps = {
  user: User;
  className?: string;
};

/** Аватар, имя и email в строку: карточка профиля, кнопка меню пользователя */
export const UserInfo = ({ user, className }: UserInfoProps) => (
  <span className={cn('flex min-w-0 items-center gap-2.5', className)}>
    <UserAvatar user={user} />
    <span className="min-w-0 flex-1 text-left">
      <span className="block truncate text-sm font-medium">{user.name}</span>
      <span className="block truncate text-xs text-muted-foreground">{user.email}</span>
    </span>
  </span>
);
```

`apps/web/src/entities/user/model/user.model.ts`

```ts
import { PRESENCE_COUNT, presenceColor } from '@/shared/config/board';

import type { User } from './user.types';

export const userModel = {
  getInitials(user: Pick<User, 'name'>): string {
    return user.name
      .trim()
      .split(/\s+/)
      .slice(0, 2)
      .map((word) => word[0] ?? '')
      .join('')
      .toUpperCase();
  },

  /** Цвет аватара из палитры presence: один и тот же для пользователя на любом устройстве */
  getAvatarColor(user: Pick<User, 'id'>): string {
    const hash = [...user.id].reduce((sum, char) => sum + char.charCodeAt(0), 0);
    return presenceColor(hash % PRESENCE_COUNT);
  },
};
```

`apps/web/src/pages/settings-page/settings-page.tsx`

```tsx
import { UserInfo } from '@/entities/user';
import { ROUTES } from '@/shared/routes';
import { UiCard } from '@/shared/ui/composables/ui-card';
import { Show } from '@/shared/ui/control-flow/show';

import { useSettingsPageFacade } from './model/use-settings-page-facade';

const { SECTIONS } = ROUTES.SETTINGS;

export const SettingsPage = () => {
  const { user } = useSettingsPageFacade();

  return (
    <div className="flex max-w-2xl flex-col gap-6 p-6">
      <h1 className="text-2xl font-semibold tracking-tight">Настройки</h1>

      <UiCard id={SECTIONS.PROFILE} title="Профиль" description="Данные аккаунта из GET /api/auth/me">
        <Show when={!!user} data={user}>
          {(user) => <UserInfo user={user} />}
        </Show>
      </UiCard>

      {/* Секции из design/settings.html: на них ведёт меню пользователя, сами настройки — следующими задачами */}
      <UiCard
        id={SECTIONS.NOTIFICATIONS}
        title="Уведомления"
        description="Упоминания, комментарии и приглашения на почту. Скоро."
        className="scroll-mt-6"
      />
      <UiCard
        id={SECTIONS.TELEGRAM}
        title="Telegram-бот"
        description="Уведомления и быстрые заметки на доску из Telegram. Скоро."
        className="scroll-mt-6"
      />
    </div>
  );
};
```

`apps/web/src/pages/settings-page/model/use-settings-page-facade.ts`

```ts
import { useEffect } from 'react';
import { useLocation } from 'react-router';

import { authStore, authStoreSelectors } from '@/core/auth';

export const useSettingsPageFacade = () => {
  const user = authStore.use(authStoreSelectors.user);
  const { hash } = useLocation();

  // React Router сам к якорю не прокручивает: /settings#telegram из меню пользователя должен открыть нужную секцию
  useEffect(() => {
    if (hash) document.getElementById(hash.slice(1))?.scrollIntoView({ behavior: 'smooth' });
  }, [hash]);

  return { user };
};
```

`apps/web/src/shared/routes.ts`

```ts
export const ROUTES = {
  LANDING: {
    path: '/',
  },
  AUTH: {
    path: '/auth',
    LOGIN: {
      path: '/auth/login',
    },
    REGISTER: {
      path: '/auth/register',
    },
    FORGOT_PASSWORD: {
      path: '/auth/forgot-password',
    },
  },
  BOARDS: {
    path: '/boards',
  },
  BOARD: {
    path: '/board/:boardId',
    build: (boardId: string) => `/board/${boardId}`,
  },
  SETTINGS: {
    path: '/settings',
    // Секции страницы настроек: id карточки и якорь в ссылке
    SECTIONS: {
      PROFILE: 'profile',
      NOTIFICATIONS: 'notifications',
      TELEGRAM: 'telegram',
    },
    build: (section: string) => `/settings#${section}`,
  },
  NOT_FOUND: {
    path: '*',
  },
} as const;
```

## 6. Замена setFormApiErrors

**Чем был плох старый вариант.** Хелпер снаружи императивно менял форму: каждому фасаду нужны были `try/catch`, `form.setError` и каст `path as Path<Values>`. Если бэк присылал issue по полю, которого нет в форме, ошибка молча пропадала. `isSubmitting` держался на промисе, который фасад обязан был не уронить.

**Что сделал.** Использовал штатный механизм обеих библиотек: отправка формы — `useMutation` (TanStack Query), ошибки сервера — проп `errors` у `useForm`. Этот проп react-hook-form сделал как раз для ошибок с сервера. Фасад теперь декларативный:

```ts
const { mutate, error, isPending } = useMutation({ mutationFn: signIn });
const form = useForm({ ..., errors: useFormServerErrors(error, DEFAULT_VALUES, 'Не удалось войти…') });
```

- `toFormServerErrors` — чистая функция с тестами. Issues по полям формы ставит на поля, issues по чужим полям и ошибку без issues — в `root`, чтобы пользователь их увидел.
- При новой отправке мутация сбрасывает `error`, react-hook-form сам убирает старые серверные ошибки и фокусирует поле с новой ошибкой (проверил в браузере на 409 при регистрации).
- Кнопка смотрит на `isPending` мутации. Ни `try/catch`, ни `setError` в фасадах больше нет.
- Страница сброса пароля стала проще: `useState` для `sentTo`/`isResending` не нужны. Email берётся из `variables` успешной мутации, повторная отправка — отдельная мутация с тостами в `onSuccess`/`onError`.
- В `Form` был твой TODO «почему ошибка показывается только в DEV_MODE». Ответ: `form.handleSubmit` пробрасывает ошибку из `onSubmit`, а `catch` глушил её, чтобы не было unhandled rejection. Теперь ошибки запроса туда не долетают вообще, а всё, что долетело, — баг, поэтому `.catch(reportError)`: в dev это консоль, в проде — Sentry.

Ограничение: в `useFormServerErrors` в зависимостях memo только `error` (`eslint-disable` с объяснением). Иначе объект `DEFAULT_VALUES`, созданный прямо в рендере, вызвал бы бесконечный ре-рендер. Вложенные поля (`items.0.name`) пока не поддерживаются, это помечено `shortcut:`.

`apps/web/src/shared/lib/helpers/form-server-errors.ts`

```ts
import type { FieldError, FieldErrors, FieldValues } from 'react-hook-form';

import { getApiError } from '@/shared/api/http-client';

/**
 * Ошибка запроса → ошибки формы для `useForm({ errors })`.
 * issues по полям формы — на поля, issues по чужим полям и ошибка без issues — в root (алерт над формой).
 * shortcut: только плоские формы (path = имя поля), для вложенных полей понадобится set по пути
 */
export const toFormServerErrors = <Values extends FieldValues>(
  error: unknown,
  defaultValues: Values,
  fallbackMessage: string,
): FieldErrors<Values> | undefined => {
  if (!error) return undefined;

  const apiError = getApiError(error);
  const errors: Record<string, FieldError> = {};
  const otherMessages: string[] = [];

  for (const { path, message } of apiError?.issues ?? []) {
    if (Object.hasOwn(defaultValues, path)) {
      errors[path] = { type: 'server', message };
    } else {
      otherMessages.push(message);
    }
  }

  if (otherMessages.length || !Object.keys(errors).length) {
    errors.root = { type: 'server', message: otherMessages.join('. ') || apiError?.message || fallbackMessage };
  }

  // Ключи пришли с сервера, но выше оставили только поля формы
  return errors as FieldErrors<Values>;
};
```

`apps/web/src/shared/lib/helpers/form-server-errors.test.ts`

```ts
import { AxiosError, AxiosHeaders } from 'axios';
import { describe, expect, it } from 'vitest';

import type { ApiError } from '@repo/contracts';

import { toFormServerErrors } from './form-server-errors';

const values = { email: '', password: '' };
const FALLBACK = 'Не удалось';

const apiError = (data: ApiError) =>
  new AxiosError('Request failed', 'ERR_BAD_REQUEST', undefined, undefined, {
    data,
    status: 400,
    statusText: '',
    headers: {},
    config: { headers: new AxiosHeaders() },
  });

describe('toFormServerErrors', () => {
  it('без ошибки — undefined', () => {
    expect(toFormServerErrors(null, values, FALLBACK)).toBeUndefined();
  });

  it('issues по полям формы — на поля', () => {
    const error = apiError({
      code: 'CONFLICT',
      message: 'Конфликт',
      issues: [{ path: 'email', message: 'Email занят' }],
    });

    expect(toFormServerErrors(error, values, FALLBACK)).toEqual({ email: { type: 'server', message: 'Email занят' } });
  });

  it('issues по чужим полям — в root, чтобы пользователь их увидел', () => {
    const error = apiError({
      code: 'VALIDATION_ERROR',
      message: 'Ошибка',
      issues: [
        { path: 'email', message: 'Email занят' },
        { path: 'captcha', message: 'Пройдите проверку' },
      ],
    });

    expect(toFormServerErrors(error, values, FALLBACK)).toEqual({
      email: { type: 'server', message: 'Email занят' },
      root: { type: 'server', message: 'Пройдите проверку' },
    });
  });

  it('ошибка api без issues — её message в root', () => {
    const error = apiError({ code: 'BAD_REQUEST', message: 'Неверный email или пароль' });

    expect(toFormServerErrors(error, values, FALLBACK)).toEqual({
      root: { type: 'server', message: 'Неверный email или пароль' },
    });
  });

  it('не ответ api (сеть, баг) — fallback в root', () => {
    expect(toFormServerErrors(new Error('Network Error'), values, FALLBACK)).toEqual({
      root: { type: 'server', message: FALLBACK },
    });
  });
});
```

`apps/web/src/shared/lib/hooks/use-form-server-errors.ts`

```ts
import { useMemo } from 'react';
import type { FieldValues } from 'react-hook-form';

import { toFormServerErrors } from '@/shared/lib/helpers/form-server-errors';

/**
 * Ошибки сервера для `useForm({ errors })`: error — из useMutation, пересчёт только при новой ошибке.
 * При новом запросе error сбрасывается в null, и react-hook-form сам убирает старые ошибки
 */
export const useFormServerErrors = <Values extends FieldValues>(
  error: unknown,
  defaultValues: Values,
  fallbackMessage: string,
) =>
  // defaultValues и fallbackMessage — константы формы. С ними в зависимостях объект, созданный в рендере,
  // давал бы новые errors на каждом рендере, а useForm на каждые новые errors рендерит форму снова
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useMemo(() => toFormServerErrors(error, defaultValues, fallbackMessage), [error]);
```

`apps/web/src/pages/login-page/model/use-login-page-facade.ts`

```ts
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';

import { authStore, authStoreSelectors, loginFormSchema, type LoginFormValues, type LoginInput } from '@/core/auth';
import { useFormServerErrors } from '@/shared/lib/hooks/use-form-server-errors';

const DEFAULT_VALUES: LoginFormValues = { email: '', password: '' };

export const useLoginPageFacade = () => {
  const { signIn } = authStore.use(authStoreSelectors.actions);
  const { mutate, error, isPending } = useMutation({ mutationFn: signIn });

  const form = useForm<LoginFormValues, unknown, LoginInput>({
    defaultValues: DEFAULT_VALUES,
    resolver: zodResolver(loginFormSchema),
    errors: useFormServerErrors(error, DEFAULT_VALUES, 'Не удалось войти. Попробуйте ещё раз'),
  });

  // После входа GuestRoute сам уведёт на доски
  const handleLogin = (values: LoginInput) => mutate(values);

  return { form, isPending, handleLogin };
};
```

`apps/web/src/pages/register-page/model/use-register-page-facade.ts`

```ts
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';

import {
  authStore,
  authStoreSelectors,
  registerFormSchema,
  type RegisterFormValues,
  type RegisterInput,
} from '@/core/auth';
import { useFormServerErrors } from '@/shared/lib/hooks/use-form-server-errors';

const DEFAULT_VALUES: RegisterFormValues = { name: '', email: '', password: '' };

export const useRegisterPageFacade = () => {
  const { register } = authStore.use(authStoreSelectors.actions);
  const { mutate, error, isPending } = useMutation({ mutationFn: register });

  const form = useForm<RegisterFormValues, unknown, RegisterInput>({
    defaultValues: DEFAULT_VALUES,
    resolver: zodResolver(registerFormSchema),
    errors: useFormServerErrors(error, DEFAULT_VALUES, 'Не удалось создать аккаунт. Попробуйте ещё раз'),
  });

  const handleRegister = (values: RegisterInput) => mutate(values);

  return { form, isPending, handleRegister };
};
```

`apps/web/src/pages/forgot-password-page/model/use-forgot-password-page-facade.ts`

```ts
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';

import {
  authService,
  forgotPasswordFormSchema,
  type ForgotPasswordFormValues,
  type ForgotPasswordInput,
} from '@/core/auth';
import { getApiErrorMessage } from '@/shared/api/http-client';
import { useFormServerErrors } from '@/shared/lib/hooks/use-form-server-errors';
import { toastService } from '@/shared/services/toast/service';

const DEFAULT_VALUES: ForgotPasswordFormValues = { email: '' };

export const useForgotPasswordPageFacade = () => {
  const resetRequest = useMutation({ mutationFn: authService.requestPasswordReset });

  const resend = useMutation({
    mutationFn: authService.requestPasswordReset,
    onSuccess: () => toastService.showSuccess('Письмо отправлено повторно'),
    onError: (error) => toastService.showError(getApiErrorMessage(error) ?? 'Не удалось отправить письмо'),
  });

  const form = useForm<ForgotPasswordFormValues, unknown, ForgotPasswordInput>({
    defaultValues: DEFAULT_VALUES,
    resolver: zodResolver(forgotPasswordFormSchema),
    errors: useFormServerErrors(resetRequest.error, DEFAULT_VALUES, 'Не удалось отправить ссылку. Попробуйте ещё раз'),
  });

  // Экран «Проверьте почту» — пока жива успешная мутация, email берём из её аргументов
  const sentTo = resetRequest.isSuccess ? resetRequest.variables.email : null;

  const handleSubmit = (values: ForgotPasswordInput) => resetRequest.mutate(values);

  const handleResend = () => {
    if (sentTo) resend.mutate({ email: sentTo });
  };

  return {
    form,
    sentTo,
    isPending: resetRequest.isPending,
    isResending: resend.isPending,
    handleSubmit,
    handleResend,
  };
};
```

`apps/web/src/pages/forgot-password-page/forgot-password-page.tsx`

```tsx
import { ArrowLeftIcon } from 'lucide-react';
import { Link } from 'react-router';

import { AuthFormLayout } from '@/core/auth';
import { ROUTES } from '@/shared/routes';
import { Show } from '@/shared/ui/control-flow/show';
import { Button } from '@/shared/ui/primitives/button/button';

import { useForgotPasswordPageFacade } from './model/use-forgot-password-page-facade';
import { ForgotPasswordForm } from './ui/forgot-password-form';
import { ResetLinkSent } from './ui/reset-link-sent';

export const ForgotPasswordPage = () => {
  const { form, sentTo, isPending, isResending, handleSubmit, handleResend } = useForgotPasswordPageFacade();

  return (
    <Show
      when={!!sentTo}
      data={sentTo}
      fallback={
        <>
          <Button asChild variant="ghost" size="sm" className="mb-4 -ml-2 text-muted-foreground">
            <Link to={ROUTES.AUTH.LOGIN.path}>
              <ArrowLeftIcon />
              Ко входу
            </Link>
          </Button>
          <AuthFormLayout
            title="Восстановление пароля"
            description="Пришлём ссылку для сброса. Она действует 30 минут."
          >
            <ForgotPasswordForm form={form} isPending={isPending} onSubmit={handleSubmit} />
          </AuthFormLayout>
        </>
      }
    >
      {(email) => <ResetLinkSent email={email ?? ''} isResending={isResending} onResend={handleResend} />}
    </Show>
  );
};
```

`apps/web/src/shared/ui/form/form.tsx`

```tsx
import type { BaseSyntheticEvent, ReactNode } from 'react';
import { FormProvider, type FieldValues, type UseFormReturn } from 'react-hook-form';

import { reportError } from '@/shared/lib/helpers/sentry-monitoring';

type FormProps<Input extends FieldValues, Output extends FieldValues> = {
  form: UseFormReturn<Input, unknown, Output>;
  children: (form: UseFormReturn<Input, unknown, Output>) => ReactNode;
  onSubmit?: (values: Output) => void | Promise<void>;
  className?: string;
};

export const Form = <Input extends FieldValues, Output extends FieldValues = Input>({
  children,
  form,
  className,
  onSubmit,
}: FormProps<Input, Output>) => {
  const handleSubmit =
    onSubmit &&
    ((event: BaseSyntheticEvent) =>
      form
        .handleSubmit(onSubmit)(event)
        // Сюда долетают только непойманные ошибки: ошибки запроса фасад показывает сам. Это баг — в мониторинг
        .catch(reportError));

  return (
    <FormProvider {...form}>
      <form noValidate className={className} onSubmit={handleSubmit}>
        {children(form)}
      </form>
    </FormProvider>
  );
};
```

## 7. Alert как composable

`UiAlert` в `shared/ui/composables/ui-alert/` с плоскими пропсами `variant`, `title`, `description`, `icon`. Иконка по умолчанию зависит от варианта. Стили ошибки (`border-destructive/30 bg-destructive/5`) переехали в вариант `destructive` самого примитива, чтобы не повторять их в формах. На `UiAlert` переведены формы входа и регистрации и `ErrorAlert`. Есть история в Storybook.

```tsx
<UiAlert variant="destructive" description={errors.root?.message} />
```

`apps/web/src/shared/ui/composables/ui-alert/ui-alert.tsx`

```tsx
import type { ComponentProps, ReactNode } from 'react';
import { CircleAlertIcon, InfoIcon } from 'lucide-react';

import { Show } from '@/shared/ui/control-flow/show';
import { Alert, AlertDescription, AlertTitle } from '@/shared/ui/primitives/alert';

type UiAlertVariant = NonNullable<ComponentProps<typeof Alert>['variant']>;

type UiAlertProps = {
  variant?: UiAlertVariant;
  title?: ReactNode;
  description?: ReactNode;
  /** По умолчанию — иконка варианта */
  icon?: ReactNode;
  className?: string;
};

const DEFAULT_ICONS: Record<UiAlertVariant, ReactNode> = {
  default: <InfoIcon />,
  destructive: <CircleAlertIcon />,
};

export const UiAlert = ({
  variant = 'default',
  title,
  description,
  icon = DEFAULT_ICONS[variant],
  className,
}: UiAlertProps) => (
  <Alert variant={variant} className={className}>
    {icon}
    <Show when={!!title}>
      <AlertTitle>{title}</AlertTitle>
    </Show>
    <Show when={!!description}>
      <AlertDescription>{description}</AlertDescription>
    </Show>
  </Alert>
);
```

`apps/web/src/shared/ui/composables/ui-alert/ui-alert.stories.tsx`

```tsx
import type { Meta, StoryObj } from '@storybook/react-vite';

import { UiAlert } from './ui-alert';

const meta = {
  title: 'Composables/UiAlert',
  component: UiAlert,
  args: {
    description: 'Ссылка для сброса пароля действует 30 минут.',
  },
} satisfies Meta<typeof UiAlert>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

/** Ошибка формы над полями */
export const Destructive: Story = {
  args: {
    variant: 'destructive',
    description: 'Неверный email или пароль',
  },
};

export const WithTitle: Story = {
  args: {
    title: 'Доска только для чтения',
    description: 'Попросите владельца выдать права редактора.',
  },
};
```

`apps/web/src/shared/ui/errors/error-alert.tsx`

```tsx
import { UiAlert } from '@/shared/ui/composables/ui-alert';

type ErrorAlertProps = {
  errorMessage?: string;
};

export const ErrorAlert = ({ errorMessage }: ErrorAlertProps) => (
  <UiAlert variant="destructive" title={errorMessage ?? 'Произошла ошибка'} />
);
```

`apps/web/src/pages/login-page/ui/login-form.tsx`

```tsx
import { Link } from 'react-router';

import type { LoginFormValues, LoginInput } from '@/core/auth';
import type { FormReturn } from '@/shared/lib/types/form';
import { ROUTES } from '@/shared/routes';
import { Spinner } from '@/shared/ui/composables/spinner';
import { UiAlert } from '@/shared/ui/composables/ui-alert';
import { Show } from '@/shared/ui/control-flow/show';
import { Form } from '@/shared/ui/form/form';
import { InputField } from '@/shared/ui/form/input-field';
import { PasswordField } from '@/shared/ui/form/password-field';
import { Button } from '@/shared/ui/primitives/button/button';

type LoginFormProps = {
  form: FormReturn<LoginFormValues, LoginInput>;
  isPending: boolean;
  onSubmit: (values: LoginInput) => void;
};

export const LoginForm = ({ form, isPending, onSubmit }: LoginFormProps) => (
  <Form className="flex flex-col gap-4" form={form} onSubmit={onSubmit}>
    {({ register, formState: { errors } }) => (
      <>
        <Show when={!!errors.root?.message}>
          <UiAlert variant="destructive" description={errors.root?.message} />
        </Show>

        <InputField
          type="email"
          autoComplete="email"
          label="Email"
          placeholder="anya@team.ru"
          error={errors.email?.message}
          {...register('email')}
        />

        <PasswordField
          autoComplete="current-password"
          label="Пароль"
          labelAction={
            <Link to={ROUTES.AUTH.FORGOT_PASSWORD.path} className="text-xs text-muted-foreground hover:text-foreground">
              Забыли пароль?
            </Link>
          }
          error={errors.password?.message}
          {...register('password')}
        />

        <Button type="submit" className="w-full" disabled={isPending}>
          <Show when={isPending}>
            <Spinner />
          </Show>
          Войти
        </Button>
      </>
    )}
  </Form>
);
```

`apps/web/src/pages/register-page/ui/register-form.tsx`

```tsx
import { useWatch } from 'react-hook-form';

import { authModel, type RegisterFormValues, type RegisterInput } from '@/core/auth';
import type { FormReturn } from '@/shared/lib/types/form';
import { Spinner } from '@/shared/ui/composables/spinner';
import { UiAlert } from '@/shared/ui/composables/ui-alert';
import { Show } from '@/shared/ui/control-flow/show';
import { Form } from '@/shared/ui/form/form';
import { InputField } from '@/shared/ui/form/input-field';
import { PasswordField } from '@/shared/ui/form/password-field';
import { Button } from '@/shared/ui/primitives/button/button';

import { PasswordStrength } from './password-strength';

type RegisterFormProps = {
  form: FormReturn<RegisterFormValues, RegisterInput>;
  isPending: boolean;
  onSubmit: (values: RegisterInput) => void;
};

export const RegisterForm = ({ form, isPending, onSubmit }: RegisterFormProps) => {
  const password = useWatch({ control: form.control, name: 'password' });

  return (
    <Form className="flex flex-col gap-4" form={form} onSubmit={onSubmit}>
      {({ register, formState: { errors } }) => (
        <>
          <Show when={!!errors.root?.message}>
            <UiAlert variant="destructive" description={errors.root?.message} />
          </Show>

          <InputField
            autoComplete="name"
            label="Имя"
            placeholder="Аня Смирнова"
            error={errors.name?.message}
            {...register('name')}
          />

          <InputField
            type="email"
            autoComplete="email"
            label="Email"
            placeholder="anya@team.ru"
            error={errors.email?.message}
            {...register('email')}
          />

          <PasswordField
            autoComplete="new-password"
            label="Пароль"
            description={<PasswordStrength strength={authModel.getPasswordStrength(password)} />}
            error={errors.password?.message}
            {...register('password')}
          />

          <Button type="submit" className="w-full" disabled={isPending}>
            <Show when={isPending}>
              <Spinner />
            </Show>
            Создать аккаунт
          </Button>

          <p className="text-center text-xs text-muted-foreground">
            Нажимая кнопку, вы принимаете условия и политику конфиденциальности.
          </p>
        </>
      )}
    </Form>
  );
};
```

## 8. Проверить переименование Header

Переименование было не везде: `app/layouts/landing-layout.tsx` ещё импортировал `SiteHeader`. Исправил. Больше старое имя нигде не встречается (`grep SiteHeader` пусто, кроме этого отчёта и todos).

`apps/web/src/app/layouts/landing-layout.tsx`

```tsx
import { Outlet } from 'react-router';

import { Header } from '@/widgets/header';

export const LandingLayout = () => (
  <div className="flex min-h-dvh flex-col">
    <Header />
    <main className="flex-1">
      <Outlet />
    </main>
  </div>
);
```

## 9. AppSidebar → Sidebar

Папка `widgets/app-sidebar` → `widgets/sidebar`, файл `app-sidebar.tsx` → `sidebar.tsx`. Импорт в `app-layout.tsx` поправлен, старое имя нигде не осталось. Код — в пункте 5.

## 10. Ошибка `import.meta.dirname` в eslint.config.mjs

**Суть.** В файле стоит `// @ts-check`, и редактор проверяет его TypeScript-ом. Сам TypeScript про `import.meta.dirname` не знает: это API Node.js (с 20.11), а его типы лежат в `@types/node`. Сработали две причины сразу:

1. В корне репозитория `@types/node` не было. Он стоит только в `apps/web` и `apps/api`, а pnpm не поднимает зависимости пакетов в корень, так что из `eslint.config.mjs` его не видно.
2. У нас TypeScript 6. В нём опция `types` по умолчанию стала `[]`: пакеты `@types/*` больше не подключаются сами, даже если лежат в `node_modules`. Раньше хватило бы одного установленного `@types/node`.

**Исправление.** `@types/node` (версия из `catalog:`) добавлен в корневые devDependencies, а в начале конфига — `/// <reference types="node" />`. Проверил: `tsc --checkJs eslint.config.mjs` с настройками как у редактора проходит без ошибок, до правки была ошибка TS2339.

```js
// @ts-check
// TypeScript 6 не подключает @types/* сам (types по умолчанию — []), а import.meta.dirname описан в @types/node
/// <reference types="node" />
```

## 11. Имя константы Z

Переименовал в `Z_INDEX`: название сразу говорит, что это значения `z-index`, и стоит в одном ряду с соседними `BOARD`, `TIMINGS`, `MOTION`. Были варианты `LAYERS` и `BOARD_LAYERS`, но слово «слой» в редакторе холста легко спутать со слоями объектов на доске. Нигде в коде константа пока не используется.

```ts
/** z-index слоёв интерфейса над холстом: чем больше, тем выше */
export const Z_INDEX = { canvas: 0, overlay: 10, /* … */ toast: 100 } as const;
```

## 12. baseURL в httpClient

Согласен, так лучше: базовый адрес задаётся в одном месте, а `API_URLS` — чистые пути, которые читаются как в документации бэка. В `constants.ts` появился `API_BASE_URL` (из `VITE_APP_API_URL`, без слэша в конце), он и есть `baseURL` у `httpClient`. Моки MSW ловят полный адрес, поэтому для хендлеров добавлен `apiUrl(path)` в `mocks/lib/http.ts`.

`apps/web/src/shared/api/constants.ts`

```ts
import { env } from '@/shared/config/env/config';

/** Адрес api: baseURL для httpClient. Без слэша в конце */
export const API_BASE_URL = env.VITE_APP_API_URL.replace(/\/+$/, '');

/** Пути эндпоинтов относительно API_BASE_URL */
export const API_URLS = {
  auth: {
    login: '/auth/login',
    register: '/auth/register',
    refresh: '/auth/refresh',
    logout: '/auth/logout',
    me: '/auth/me',
    forgotPassword: '/auth/forgot-password',
  },
  featureFlags: {
    list: '/feature-flags',
  },
} as const;
```

`apps/web/src/shared/api/http-client.ts`

```ts
import axios, { isAxiosError } from 'axios';

import type { ApiError } from '@repo/contracts';

import { API_BASE_URL } from './constants';

export const httpClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

/** Тело ошибки api (ApiErrorSchema из contracts) или undefined, если это не ответ api */
export const getApiError = (error: unknown): ApiError | undefined => {
  if (!isAxiosError<ApiError>(error)) {
    return undefined;
  }

  const data = error.response?.data;

  return data && typeof data.message === 'string' ? data : undefined;
};

export const getApiErrorMessage = (error: unknown): string | undefined => {
  return getApiError(error)?.message;
};

export const getApiErrorStatus = (error: unknown): number | undefined => {
  return isAxiosError(error) ? error.response?.status : undefined;
};
```

`apps/web/src/mocks/lib/http.ts`

```ts
import { HttpResponse } from 'msw';

import type { ApiError } from '@repo/contracts';

import { API_BASE_URL } from '@/shared/api/constants';

import { db, type MockUser } from '../db';
import { verifyToken } from './tokens';

// UNAUTHORIZED есть в контракте ветки feat/b-01-auth-contract, в dev его ещё нет
type MockApiError = Omit<ApiError, 'code'> & { code: ApiError['code'] | 'UNAUTHORIZED' };

/** Полный адрес для хендлера: httpClient ходит на API_BASE_URL + путь из API_URLS */
export const apiUrl = (path: string) => `${API_BASE_URL}${path}`;

/** Ошибка в формате контракта: { code, message, issues? } */
export const errorResponse = (status: number, body: MockApiError) => HttpResponse.json(body, { status });

export const unauthorizedResponse = () =>
  errorResponse(401, { code: 'UNAUTHORIZED', message: 'Требуется авторизация' });

/** Пользователь из заголовка `Authorization: Bearer <accessToken>` */
export const getAuthorizedUser = (request: Request): MockUser | undefined => {
  const token = request.headers.get('Authorization')?.replace(/^Bearer\s+/, '');
  const userId = verifyToken(token, 'access');

  return userId ? db.users.findById(userId) : undefined;
};
```

`apps/web/src/mocks/handlers/feature-flags.handlers.ts`

```ts
import { delay, http, HttpResponse } from 'msw';

import { API_URLS } from '@/shared/api/constants';

import { apiUrl } from '../lib/http';

/** Значения «с бэкенда». В dev их можно переопределить через FeatureFlagsDevtools */
const FEATURE_FLAGS: Record<string, boolean> = {
  theme: true,
};

export const featureFlagsHandlers = [
  http.get(apiUrl(API_URLS.featureFlags.list), async () => {
    await delay();
    return HttpResponse.json(FEATURE_FLAGS);
  }),
];
```

## 13. Настройка queryClient и refetchOnWindowFocus

**Как настроено сейчас:**

- `staleTime: 30_000`. 30 секунд данные считаются свежими: повторный `useQuery` с тем же ключом, фокус окна и восстановление сети их не перезапрашивают. После 30 секунд данные «устаревают», но показываются из кэша, а запрос уходит в фоне.
- `gcTime` по умолчанию — 5 минут. Кэш запроса без подписчиков живёт 5 минут: вернулся на страницу — данные видны сразу.
- `retry` — свой: повторяем только при сетевых ошибках и 5xx, не больше 2 раз (с экспоненциальной задержкой по умолчанию). 4xx не повторяем, ошибка не исчезнет; 401 обновляет auth-интерцептор.
- `refetchOnWindowFocus`, `refetchOnReconnect` — `true` по умолчанию, срабатывают только для устаревших данных.
- `mutations: { retry: false }` я убрал: мутации и так не повторяются (`retry: 0` по умолчанию).

**Отключать ли refetchOnWindowFocus.** Советую оставить включённым. Он перезапрашивает только данные старше 30 секунд, то есть одним лёгким запросом при возврате во вкладку. Для совместного продукта это полезно: коллега создал доску, ты вернулся во вкладку — список уже свежий. Без этого нужен сокет и на списки. Мешать он будет только данным, которые обновляет сокет (содержимое доски). Правильная настройка для них — `staleTime: Infinity` в конкретном `useQuery`, а не глобальное отключение. Записал это комментарием в конфиге и в `docs/frontend.md`.

`apps/web/src/shared/api/query-client.ts`

```ts
import { QueryClient } from '@tanstack/react-query';

import { getApiErrorStatus } from './http-client';

const MAX_RETRIES = 2;

// Мутации по умолчанию не повторяются (retry: 0), отдельная настройка для них не нужна
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // 30 секунд данные свежие: повторный useQuery, фокус окна и переподключение сети их не перезапрашивают.
      // refetchOnWindowFocus оставлен включённым (по умолчанию): после возврата во вкладку устаревший список досок обновится.
      // Данные, которые обновляет сокет (содержимое доски), получат staleTime: Infinity в своём useQuery
      staleTime: 30_000,
      // 4xx повторять бессмысленно (ошибка не исчезнет), 401 обновляет auth-интерцептор
      retry: (failureCount, error) => {
        const status = getApiErrorStatus(error);
        return (status === undefined || status >= 500) && failureCount < MAX_RETRIES;
      },
    },
  },
});
```

## 14. Фасады Card, Dialog и остальных компонентов

- `UiCard` — `title`, `description`, `action`, `footer`, `children`, `contentClassName` и любые пропсы div (`id`, `className`). Каждую часть рендерит, только если она передана. На него переведена страница настроек.
- `UiDialog` — `trigger`, `title` (обязателен для скринридера), `description`, `children`, `footer`, `open`/`defaultOpen`/`onOpenChange`, `showCloseButton`. Без описания сам передаёт `aria-describedby={undefined}`, иначе radix предупреждает в консоли. В приложении диалогов пока нет, поэтому есть история в Storybook.
- `UiDropdownMenu` (новый) — `trigger` и `items`. Пункт меню — ссылка (`to`), действие (`onSelect`), разделитель или подпись. Есть варианты `destructive` и `disabled`. На нём сделаны меню пользователя и переключатель пространства, дальше пригодится для меню карточки доски.
- Подписи «Close» в `dialog.tsx` и `sheet.tsx` перевёл на «Закрыть».
- **Что ещё стоит свернуть в фасад, когда понадобится:** `Sheet` — сейчас используется один раз, внутри сайдбара. `Tooltip` — нужен для тулбара холста. `ErrorPageElement` — уже фасад внутри `shared`, трогать не стал. `UiPopover` и `UiHoverCard` уже фасады. Поля форм (`InputField` и др.) уже сделаны так же.

`apps/web/src/shared/ui/composables/ui-card/ui-card.tsx`

```tsx
import type { ComponentProps, ReactNode } from 'react';

import { Show } from '@/shared/ui/control-flow/show';
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/shared/ui/primitives/card';

type UiCardProps = {
  title?: ReactNode;
  description?: ReactNode;
  /** Справа от заголовка: кнопка, меню */
  action?: ReactNode;
  footer?: ReactNode;
  children?: ReactNode;
  contentClassName?: string;
} & Omit<ComponentProps<typeof Card>, 'title' | 'children'>;

export const UiCard = ({ title, description, action, footer, children, contentClassName, ...props }: UiCardProps) => (
  <Card {...props}>
    <Show when={!!title || !!description || !!action}>
      <CardHeader>
        <Show when={!!title}>
          <CardTitle>{title}</CardTitle>
        </Show>
        <Show when={!!description}>
          <CardDescription>{description}</CardDescription>
        </Show>
        <Show when={!!action}>
          <CardAction>{action}</CardAction>
        </Show>
      </CardHeader>
    </Show>

    <Show when={!!children}>
      <CardContent className={contentClassName}>{children}</CardContent>
    </Show>

    <Show when={!!footer}>
      <CardFooter>{footer}</CardFooter>
    </Show>
  </Card>
);
```

`apps/web/src/shared/ui/composables/ui-card/ui-card.stories.tsx`

```tsx
import type { Meta, StoryObj } from '@storybook/react-vite';

import { Button } from '../../primitives/button';
import { UiCard } from './ui-card';

const meta = {
  title: 'Composables/UiCard',
  component: UiCard,
  args: {
    title: 'Профиль',
    description: 'Имя и email видят участники пространства',
    children: 'Содержимое карточки',
  },
  decorators: [
    (Story) => (
      <div className="max-w-md">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof UiCard>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const WithActionAndFooter: Story = {
  args: {
    action: (
      <Button variant="outline" size="sm">
        Изменить
      </Button>
    ),
    footer: <Button>Сохранить</Button>,
  },
};
```

`apps/web/src/shared/ui/composables/ui-dialog/ui-dialog.tsx`

```tsx
import type { ComponentProps, ReactNode } from 'react';

import { Show } from '@/shared/ui/control-flow/show';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/shared/ui/primitives/dialog';

type UiDialogProps = {
  /** Кнопка, которая открывает диалог. Без неё диалог управляется через open/onOpenChange */
  trigger?: ReactNode;
  /** Обязателен: по нему скринридер объявляет диалог */
  title: ReactNode;
  description?: ReactNode;
  children?: ReactNode;
  /** Кнопки действий. Закрыть из кнопки — обернуть её в DialogClose или поменять open */
  footer?: ReactNode;
  className?: string;
  showCloseButton?: boolean;
} & Pick<ComponentProps<typeof Dialog>, 'open' | 'defaultOpen' | 'onOpenChange'>;

export const UiDialog = ({
  trigger,
  title,
  description,
  children,
  footer,
  className,
  showCloseButton,
  ...rootProps
}: UiDialogProps) => (
  <Dialog {...rootProps}>
    <Show when={!!trigger}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
    </Show>

    {/* Без описания radix ждёт явный aria-describedby={undefined}, иначе предупреждает в консоли */}
    <DialogContent
      className={className}
      showCloseButton={showCloseButton}
      {...(description ? {} : { 'aria-describedby': undefined })}
    >
      <DialogHeader>
        <DialogTitle>{title}</DialogTitle>
        <Show when={!!description}>
          <DialogDescription>{description}</DialogDescription>
        </Show>
      </DialogHeader>

      {children}

      <Show when={!!footer}>
        <DialogFooter>{footer}</DialogFooter>
      </Show>
    </DialogContent>
  </Dialog>
);
```

`apps/web/src/shared/ui/composables/ui-dialog/ui-dialog.stories.tsx`

```tsx
import type { Meta, StoryObj } from '@storybook/react-vite';

import { Button } from '../../primitives/button';
import { DialogClose } from '../../primitives/dialog';
import { UiDialog } from './ui-dialog';

const meta = {
  title: 'Composables/UiDialog',
  component: UiDialog,
  args: {
    trigger: <Button variant="outline">Удалить доску</Button>,
    title: 'Удалить доску?',
    description: 'Доска попадёт в корзину. Восстановить её можно в течение 30 дней.',
    footer: (
      <>
        <DialogClose asChild>
          <Button variant="outline">Отмена</Button>
        </DialogClose>
        <Button variant="destructive">Удалить</Button>
      </>
    ),
  },
} satisfies Meta<typeof UiDialog>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const WithoutDescription: Story = {
  args: {
    description: undefined,
    children: <p className="text-sm text-muted-foreground">Произвольное содержимое диалога</p>,
  },
};
```

`apps/web/src/shared/ui/composables/ui-dropdown-menu/ui-dropdown-menu.tsx`

```tsx
import type { ComponentProps, ReactNode } from 'react';
import { Link } from 'react-router';

import { cn } from '@/shared/lib/utils';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/shared/ui/primitives/dropdown-menu';

export type UiMenuItem =
  | {
      type?: 'item';
      label: ReactNode;
      icon?: ReactNode;
      /** Ссылка внутри приложения. Если задана, пункт рендерится как Link */
      to?: string;
      onSelect?: () => void;
      variant?: 'default' | 'destructive';
      disabled?: boolean;
    }
  | { type: 'separator' }
  | { type: 'label'; label: ReactNode };

type UiDropdownMenuProps = {
  /** Должен быть фокусируемым элементом (button), чтобы меню открывалось с клавиатуры */
  trigger: ReactNode;
  items: UiMenuItem[];
  contentClassName?: string;
} & Pick<ComponentProps<typeof DropdownMenuContent>, 'align' | 'side' | 'sideOffset'>;

const renderItem = (item: UiMenuItem, index: number) => {
  if (item.type === 'separator') {
    return <DropdownMenuSeparator key={index} />;
  }

  if (item.type === 'label') {
    return <DropdownMenuLabel key={index}>{item.label}</DropdownMenuLabel>;
  }

  const content = (
    <>
      {item.icon}
      {item.label}
    </>
  );

  return (
    <DropdownMenuItem
      key={index}
      asChild={!!item.to}
      variant={item.variant}
      disabled={item.disabled}
      onSelect={item.onSelect}
    >
      {item.to ? <Link to={item.to}>{content}</Link> : content}
    </DropdownMenuItem>
  );
};

export const UiDropdownMenu = ({ trigger, items, contentClassName, ...contentProps }: UiDropdownMenuProps) => (
  <DropdownMenu>
    <DropdownMenuTrigger asChild>{trigger}</DropdownMenuTrigger>
    <DropdownMenuContent className={cn('min-w-56', contentClassName)} {...contentProps}>
      {items.map(renderItem)}
    </DropdownMenuContent>
  </DropdownMenu>
);
```

`apps/web/src/shared/ui/composables/ui-dropdown-menu/ui-dropdown-menu.stories.tsx`

```tsx
import type { Meta, StoryObj } from '@storybook/react-vite';
import { CopyIcon, ExternalLinkIcon, PencilIcon, Trash2Icon } from 'lucide-react';
import { MemoryRouter } from 'react-router';

import { Button } from '../../primitives/button';
import { UiDropdownMenu } from './ui-dropdown-menu';

const meta = {
  title: 'Composables/UiDropdownMenu',
  component: UiDropdownMenu,
  decorators: [
    (Story) => (
      <MemoryRouter>
        <Story />
      </MemoryRouter>
    ),
  ],
  args: {
    trigger: <Button variant="outline">Действия с доской</Button>,
    align: 'start',
    items: [
      { label: 'Открыть', icon: <ExternalLinkIcon />, to: '/boards' },
      { label: 'Переименовать', icon: <PencilIcon /> },
      { label: 'Дублировать', icon: <CopyIcon /> },
      { type: 'separator' },
      { label: 'В корзину', icon: <Trash2Icon />, variant: 'destructive' },
    ],
  },
} satisfies Meta<typeof UiDropdownMenu>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};
```

## 16. Ссылка «Забыли пароль?» на странице входа

Ссылка уже есть, код не менял: справа от подписи поля «Пароль» (`labelAction` у `PasswordField` в `login-form.tsx`), ведёт на `/auth/forgot-password`. Так сделано и в `design/auth.html`, и это привычное место (Google, GitHub, Linear). Если ты её не заметил, возможно, она слишком бледная (`text-xs text-muted-foreground`). Можно сделать её `text-primary` — скажи, если нужно.

## 17. Свой тип User на фронте

Описал модель фронта в `entities/user/model/user.types.ts`. `createdAt` оставил ISO-строкой, а не `Date`: модель лежит в сессии в localStorage, а `Date` через JSON не переживёт перезагрузку. Для проверки сессии из localStorage появилась схема модели `userSchema`. Это не `UserSchema` из контракта: в localStorage уже лежит модель фронта, а не ответ api.

`apps/web/src/entities/user/model/user.types.ts`

```ts
/* ----- MODEL FOR FRONTEND ----- */

/**
 * Пользователь в модели фронта. Описан здесь, а не взят из контракта: если бэк поменяет UserSchema,
 * поправим только userAdapter, а не каждый компонент
 */
export type User = {
  id: string;
  name: string;
  email: string;
  /** ISO-строка: модель лежит в сессии в localStorage, Date туда не сериализуется */
  createdAt: string;
};
```

`apps/web/src/entities/user/model/user.schema.ts`

```ts
import { z } from 'zod';

import type { User } from './user.types';

/** Схема модели фронта: проверяет пользователя из localStorage (сессия), а не ответ api — его проверяет UserSchema из контракта */
export const userSchema = z.object({
  id: z.string().min(1),
  name: z.string(),
  email: z.string(),
  createdAt: z.string(),
}) satisfies z.ZodType<User>;
```

`apps/web/src/entities/user/index.ts`

```ts
export type { User } from './model/user.types';
export { userSchema } from './model/user.schema';
export { userAdapter } from './model/user.adapter';
export { userModel } from './model/user.model';
export { UserAvatar } from './ui/user-avatar';
export { UserInfo } from './ui/user-info';
```

## 18. Показывать ли ошибку загрузки фича-флагов

**Ответ: не показывать.** Так устроены все крупные SDK флагов (LaunchDarkly, Unleash, GrowthBook, Statsig): при ошибке сеть не трогают, берут последние известные значения или значения по умолчанию, а ошибку пишут в лог или мониторинг. Причины:

- пользователь ничего не может с этой ошибкой сделать, а приложение продолжает работать;
- флаги управляют экспериментами и постепенными раскатками, и пользователь не должен знать об их существовании;
- тост при каждой загрузке на нестабильной сети только раздражает.

Что стоит добавить, когда у бэка появится `GET /api/feature-flags` (сейчас были бы 404 на каждой загрузке):

1. `reportError` при ошибке загрузки — чтобы мы, а не пользователь, узнали, что флаги не приходят.
2. Сохранять последние полученные флаги (`remoteFlags`) в localStorage и при ошибке брать их, а не значения по умолчанию, — так делают LaunchDarkly и Unleash.

Код не менял, описал в `docs/frontend.md`.

## 19. emailSchema в shared

`shared/lib/schemas/email.schema.ts`, `core/auth/model/auth.schema.ts` импортирует её оттуда.

`apps/web/src/shared/lib/schemas/email.schema.ts`

```ts
import { z } from 'zod';

/** Email в формах: обязательный, без пробелов по краям */
export const emailSchema = z.string().trim().min(1, 'Введите email').pipe(z.email('Похоже, в email опечатка'));
```

`apps/web/src/core/auth/model/auth.schema.ts`

```ts
import { z } from 'zod';

import { userSchema } from '@/entities/user';
import { emailSchema } from '@/shared/lib/schemas/email.schema';

import type { ForgotPasswordInput, LoginInput, RegisterInput, Session } from './auth.types';

export const loginFormSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, 'Введите пароль'),
}) satisfies z.ZodType<LoginInput>;

export const registerFormSchema = z.object({
  name: z.string().trim().min(1, 'Введите имя').min(2, 'Имя слишком короткое').max(100, 'Не больше 100 символов'),
  email: emailSchema,
  password: z.string().min(1, 'Введите пароль').min(8, 'Минимум 8 символов').max(128, 'Не больше 128 символов'),
}) satisfies z.ZodType<RegisterInput>;

export const forgotPasswordFormSchema = z.object({
  email: emailSchema,
}) satisfies z.ZodType<ForgotPasswordInput>;

export const accessTokenSchema = z.string().min(1);

/** Сессия из localStorage: это уже модель фронта, поэтому проверяем схемой модели, а не контракта */
export const sessionSchema = z.object({
  accessToken: accessTokenSchema,
  user: userSchema,
}) satisfies z.ZodType<Session>;

export type LoginFormValues = z.input<typeof loginFormSchema>;
export type RegisterFormValues = z.input<typeof registerFormSchema>;
export type ForgotPasswordFormValues = z.input<typeof forgotPasswordFormSchema>;
```

## 20–21. Маппинг User в адаптере сущности, схема DTO → adapter → модель

Согласен, и именно так и сделал, по образцу твоего `edenex` (`offers.adapter.ts`, `offers.repository.types.ts`):

- **DTO** — формат бэка. Пользователь берётся из `@repo/contracts` (`User as UserDto`). Ответов auth в контрактах пока нет, поэтому они описаны в `repository/auth-repository.types.ts` как `AuthResponseDto`/`RefreshResponseDto` с TODO на auth-контракт. Репозиторий типизирован DTO.
- **Adapter** — единственное место, которое знает обе модели. `userAdapter.mapUser` проверяет DTO схемой контракта и перечисляет поля явно: если бэк добавит поле, оно не попадёт в модель само. `authAdapter.mapSession` переводит пользователя через `userAdapter`, то есть формат пользователя знает только `entities/user`. Токен тоже проверяется (`mapAccessToken`).
- **Модель** — свой тип фронта (пункт 17). Сервисы возвращают модель, DTO не выходят за пределы модуля.

`apps/web/src/entities/user/model/user.adapter.ts`

```ts
import { UserSchema, type User as UserDto } from '@repo/contracts';

import type { User } from './user.types';

/** Единственное место, которое знает и DTO пользователя (контракт), и модель фронта */
export const userAdapter = {
  mapUser(dto: UserDto): User {
    // Поля перечисляем явно: новые поля из api не попадут в модель сами собой
    const { id, name, email, createdAt } = UserSchema.parse(dto);
    return { id, name, email, createdAt };
  },
};
```

`apps/web/src/entities/user/model/user.adapter.test.ts`

```ts
import { describe, expect, it } from 'vitest';

import { userAdapter } from './user.adapter';

const dto = {
  id: '019a6c3e-0000-7000-8000-000000000001',
  name: 'Аня Смирнова',
  email: 'anya@team.ru',
  createdAt: '2026-11-01T09:00:00.000Z',
};

describe('userAdapter.mapUser', () => {
  it('переводит DTO в модель и отбрасывает лишние поля', () => {
    expect(userAdapter.mapUser({ ...dto, passwordHash: 'x' } as typeof dto)).toEqual(dto);
  });

  it('падает на ответе, который не совпадает с контрактом', () => {
    expect(() => userAdapter.mapUser({ ...dto, email: 'not-an-email' })).toThrow();
  });
});
```

`apps/web/src/core/auth/model/auth.adapter.ts`

```ts
import { userAdapter } from '@/entities/user';

import type { AuthResponseDto, RefreshResponseDto } from '../repository/auth-repository.types';
import { accessTokenSchema } from './auth.schema';
import type { Session } from './auth.types';

/** DTO auth → модель фронта. Пользователя переводит адаптер сущности: формат User знает только entities/user */
export const authAdapter = {
  mapSession(dto: AuthResponseDto): Session {
    return {
      accessToken: accessTokenSchema.parse(dto.accessToken),
      user: userAdapter.mapUser(dto.user),
    };
  },

  mapAccessToken(dto: RefreshResponseDto): string {
    return accessTokenSchema.parse(dto.accessToken);
  },
};
```

`apps/web/src/core/auth/repository/auth-repository.types.ts`

```ts
import type { User as UserDto } from '@repo/contracts';

import type { ApiResponse, RequestConfig } from '@/shared/api/types';

import type { ForgotPasswordInput, LoginInput, RegisterInput } from '../model/auth.types';

/* ----- DTO: формат api. Наружу модуля не выходят, в модель фронта их переводит authAdapter ----- */

// TODO: заменить на схемы из @repo/contracts, когда бэк смержит auth-контракт (feat/b-01-auth-contract)
export type AuthResponseDto = {
  accessToken: string;
  user: UserDto;
};

export type RefreshResponseDto = {
  accessToken: string;
};

export type AuthRepository = {
  login(requestConfig: RequestConfig<LoginInput>): ApiResponse<AuthResponseDto>;
  register(requestConfig: RequestConfig<RegisterInput>): ApiResponse<AuthResponseDto>;
  refresh(requestConfig?: RequestConfig): ApiResponse<RefreshResponseDto>;
  logout(requestConfig?: RequestConfig): ApiResponse<void>;
  me(requestConfig?: RequestConfig): ApiResponse<UserDto>;
  forgotPassword(requestConfig: RequestConfig<ForgotPasswordInput>): ApiResponse<void>;
};
```

`apps/web/src/core/auth/repository/auth.repository.ts`

```ts
import type { User as UserDto } from '@repo/contracts';

import { API_URLS } from '@/shared/api/constants';
import { httpClient } from '@/shared/api/http-client';

import type { AuthRepository, AuthResponseDto, RefreshResponseDto } from './auth-repository.types';

export const authRepository: AuthRepository = {
  login({ params, config }) {
    return httpClient.post<AuthResponseDto>(API_URLS.auth.login, params, {
      ...config,
      skipAuthRefresh: true,
    });
  },

  register({ params, config }) {
    return httpClient.post<AuthResponseDto>(API_URLS.auth.register, params, {
      ...config,
      skipAuthRefresh: true,
    });
  },

  refresh(requestConfig) {
    return httpClient.post<RefreshResponseDto>(API_URLS.auth.refresh, undefined, {
      ...requestConfig?.config,
      skipAuthRefresh: true,
    });
  },

  logout(requestConfig) {
    return httpClient.post<void>(API_URLS.auth.logout, undefined, {
      ...requestConfig?.config,
      skipAuthRefresh: true,
    });
  },

  me(requestConfig) {
    return httpClient.get<UserDto>(API_URLS.auth.me, requestConfig?.config);
  },

  forgotPassword({ params, config }) {
    return httpClient.post<void>(API_URLS.auth.forgotPassword, params, {
      ...config,
      skipAuthRefresh: true,
    });
  },
};
```

## 22. Тестовый запуск Sentry

Сделал без аккаунта Sentry. Поднял локальный приёмник событий (скрипт `fake-sentry.mjs` в scratchpad) и временно создал `apps/web/.env.mocks.local`: `VITE_APP_SENTRY_DSN=http://testpublickey@localhost:5174/1`, `VITE_APP_API_PROXY_TARGET=http://localhost:9999`. Встроенный браузер не пускает запросы на другие порты, поэтому DSN указывает на тот же origin, а Vite проксирует `/api/1/envelope/` в приёмник. Затем бросил ошибку на странице.

Результат: чанк `@sentry/react` загрузился только при заданном DSN, событие пришло в приёмник:

```json
{ "type": "event", "exception": ["Error: Tandem: тестовая ошибка для Sentry"], "environment": "mocks" }
```

После проверки файл `.env.mocks.local` удалил, приёмник остановил. Чтобы проверить с настоящим Sentry или GlitchTip, положи DSN проекта в `apps/web/.env.local` (`VITE_APP_SENTRY_DSN=…`) и перезапусти dev-сервер. Как повторить локальную проверку, записано в `docs/frontend.md`.

## 23. Ревью под production

Ниже — что я бы раздал задачами, по убыванию важности. Сделанное в этом заходе здесь не повторяю.

**Надёжность и безопасность**

1. **У `httpClient` нет `timeout`** (у axios по умолчанию 0, то есть бесконечно). Зависший запрос держит спиннер вечно. Задача: `timeout: 15_000` и понятный текст для `ECONNABORTED`.
2. **При выходе не чистится кэш TanStack Query.** Как только появятся `useQuery`, данные прошлого пользователя увидит следующий. Задача: `queryClient.clear()` в `signOut` и `clearSession`.
3. **Сессия не синхронизируется между вкладками.** Вышел в одной — в другой продолжаешь работать с мёртвым токеном до первого 401. Задача: слушать `storage` для ключа `session` (у zustand persist есть `rehydrate`).
4. **accessToken лежит в localStorage**, то есть доступен любому XSS. Это часть решения бэка по транспорту auth (отложено), но для production нужен вариант «access только в памяти, refresh в httpOnly cookie» плюс CSP в nginx.
5. **`AppDataLoader` блокирует весь рендер** до ответа `/auth/me` и флагов. На медленном api даже лендинг ждёт. Задача: гостевые страницы рендерить сразу, ждать только на `PrivateRoute`.

**Мониторинг**

6. Sentry: `release` (версия из CI), загрузка sourcemaps (`@sentry/vite-plugin`), `Sentry.setUser({ id })` после входа и сброс после выхода, `tracesSampleRate` и `ignoreErrors` для шума (ResizeObserver, расширения браузера).
7. ErrorBoundary на уровне страниц, а не только корневой: упавший виджет не должен ронять всё приложение.

**Качество и процессы**

8. **E2E-тестов нет.** Задача: Playwright на моках (`dev:mocks`) — вход, регистрация, сброс пароля, выход, сайдбар. Запускать в CI.
9. **Тестов компонентов почти нет** (после удаления `login-form.test.tsx` остался только `show.test.tsx`). Задача: тесты форм через RTL — валидация, ошибка сервера на поле и в root.
10. **Неиспользуемый код шаблона:** `UiPopover`, `UiHoverCard`, `ErrorGate`, `AsyncWrapper`, `List`, `SkeletonList`, `SkeletonItems`, `RadioField`, `RadioGroupFieldset`, `TextareaField`, `CheckboxField`, `useDebounce`, `useUrlSearchParam`, `BoardLayout`. Решить, что оставить как кит (с историями в Storybook), остальное удалить.
11. `Can` — проверка прав передаётся функцией без контекста. Когда придут роли на доске (owner/editor/viewer), нужна модель прав в `core` и `useCan(action)`.
12. Основной чанк — 399 kB (124 kB gzip). Задача: разделить вендоров (`manualChunks` для radix/react-router) и проверить, что devtools и MSW не попадают в прод-бандл (`vite-bundle-visualizer`).

**UX и доступность**

13. Страница досок не читает `?view=` из сайдбара, а квота ИИ и пространства — моки. Всё это закрывается задачами «список досок» (первый `useQuery`) и «пространства» после контракта воркспейсов.
14. Нет страницы 404 внутри `AppLayout` (сейчас глобальная, без сайдбара) и страницы 403 для доски без доступа.
15. Пройти по клавиатуре и с axe: фокус после закрытия шторки, порядок табуляции в сайдбаре, контраст `text-muted-foreground` в тёмной теме.

**Документация**

16. В `docs/frontend.md` обновлены: запросы (DTO → adapter → модель, `baseURL`), формы (`useMutation` + `useFormServerErrors`), роуты (без страницы доски), сайдбар, composables, мониторинг, фича-флаги. Перед раздачей задач стоит добавить раздел «как добавить новую фичу» с примером модуля целиком (repository → adapter → service → `useQuery` в фасаде).
