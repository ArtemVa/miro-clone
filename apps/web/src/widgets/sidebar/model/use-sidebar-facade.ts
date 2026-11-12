import { useState } from 'react';
import { useLocation } from 'react-router';

import { authStore, authStoreSelectors } from '@/core/auth';
import { featureFlagsStore, featureFlagsStoreSelectors } from '@/core/feature-flags';
import { themeStore, themeStoreSelectors } from '@/core/theme';
import { ROUTES } from '@/shared/routes';
import { toastService } from '@/shared/services/toast/service';

import { BOARDS_VIEWS, MOCK_WORKSPACES } from './constants';
import type { SidebarViewModel } from './types';

export const useSidebarFacade = (): SidebarViewModel => {
  const user = authStore.use(authStoreSelectors.user);
  const { signOut } = authStore.use(authStoreSelectors.actions);

  const isThemeEnabled = featureFlagsStore.use(featureFlagsStoreSelectors.isEnabled('theme'));
  const theme = themeStore.use(themeStoreSelectors.theme);
  const { toggleTheme } = themeStore.use(themeStoreSelectors.actions);

  // shortcut: выбранное пространство живёт до перезагрузки, пока пространства — моки
  const [workspaceId, setWorkspaceId] = useState(MOCK_WORKSPACES[0]?.id);
  const workspace = MOCK_WORKSPACES.find(({ id }) => id === workspaceId);

  const selectWorkspace = (id: string) => {
    setWorkspaceId(id);
  };

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
    selectWorkspace,
    toggleTheme,
    signOut,
    handleSearch,
  };
};
