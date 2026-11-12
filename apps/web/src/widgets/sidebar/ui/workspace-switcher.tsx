import { cn } from 'cn';
import { CheckIcon, ChevronsUpDownIcon, PlusIcon, SettingsIcon } from 'lucide-react';

import { UiDropdownMenu, type UiMenuItem } from '@/shared/ui/composables/ui-dropdown-menu';
import { Show } from '@/shared/ui/control-flow/show';

import type { Workspace } from '../model/constants';

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
