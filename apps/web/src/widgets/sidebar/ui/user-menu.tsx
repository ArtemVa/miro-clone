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
