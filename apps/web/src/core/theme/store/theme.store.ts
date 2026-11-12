import { persist } from 'zustand/middleware';

import { createStore } from '@/shared/lib/helpers/create-store';

import { MEDIA_QUERY, THEME_STORAGE_KEY } from '../model/theme.constants';
import { themeModel } from '../model/theme.model';
import type { ThemeStoreSlice } from './theme.store-types';

export const themeStore = createStore<ThemeStoreSlice>()(
  persist(
    (set, get) => ({
      theme: themeModel.getSystemTheme(),
      isSystemTheme: true,
      actions: {
        setTheme: (theme) => set({ theme, isSystemTheme: false }),
        toggleTheme: () => {
          const theme = get().theme;
          set({
            theme: theme === 'dark' ? 'light' : 'dark',
            isSystemTheme: false,
          });
        },
      },
    }),
    {
      name: THEME_STORAGE_KEY,
      partialize: (state) => ({
        theme: state.isSystemTheme ? null : state.theme,
      }),
      merge: (persisted, current) => {
        const theme = themeModel.getPersistedTheme(persisted);
        return theme ? { ...current, theme, isSystemTheme: false } : current;
      },
    },
  ),
);

themeModel.applyThemeStyles(themeStore.getState().theme);
themeStore.subscribe((state) => themeModel.applyThemeStyles(state.theme));
MEDIA_QUERY.addEventListener('change', () => {
  if (themeStore.getState().isSystemTheme) {
    themeStore.setState({ theme: themeModel.getSystemTheme() });
  }
});
