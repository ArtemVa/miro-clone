import type { Simplify } from '@/shared/lib/types/common';

import type { Theme } from '../model/theme.types';

export type ThemeStoreSlice = Simplify<ThemeState & ThemeActions>;

export type ThemeState = {
  theme: Theme;
  isSystemTheme: boolean;
};

export type ThemeActions = {
  actions: {
    setTheme: (theme: Theme) => void;
    toggleTheme: () => void;
  };
};
