import type { User } from '@/entities/user';
import type { Theme } from '@/core/theme';

import type { BoardsView, Workspace } from './constants';

export type SidebarViewModel = {
  user: User | undefined;
  workspace: Workspace | undefined;
  workspaces: Workspace[];
  activeView: BoardsView | null;
  isThemeEnabled: boolean;
  theme: Theme;
  isMobileOpen: boolean;
  setIsMobileOpen: (open: boolean) => void;
  selectWorkspace: (id: string) => void;
  toggleTheme: () => void;
  signOut: () => Promise<void>;
  handleSearch: () => void;
};
