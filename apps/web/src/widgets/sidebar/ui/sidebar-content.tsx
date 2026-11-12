import { SearchIcon } from 'lucide-react';

import { Show } from '@/shared/ui/control-flow/show';

import { BOARDS_NAV, MOCK_AI_QUOTA, WORKSPACE_NAV } from '../model/constants';
import type { SidebarViewModel } from '../model/types';
import { AiQuotaCard } from './ai-quota-card';
import { SidebarNav } from './sidebar-nav';
import { UserMenu } from './user-menu';
import { WorkspaceSwitcher } from './workspace-switcher';

export const SidebarContent = ({
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
}: SidebarViewModel) => (
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
