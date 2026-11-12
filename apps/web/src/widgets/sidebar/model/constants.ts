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
