import { MEDIA_QUERY } from './theme.constants';
import type { Theme } from './theme.types';

export const themeModel = {
  getSystemTheme: (): Theme => {
    return MEDIA_QUERY.matches ? 'dark' : 'light';
  },

  isTheme: (value: unknown): value is Theme => {
    return value === 'light' || value === 'dark';
  },

  getPersistedTheme: (persisted: unknown): Theme | null => {
    if (
      typeof persisted === 'object' &&
      persisted !== null &&
      'theme' in persisted &&
      themeModel.isTheme(persisted.theme)
    ) {
      return persisted.theme;
    }

    return null;
  },

  applyThemeStyles: (theme: Theme) => {
    document.documentElement.classList.toggle('dark', theme === 'dark');
  },
};
