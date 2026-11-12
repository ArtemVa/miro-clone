import type { ThemeStoreSlice } from './theme.store-types';

export const themeStoreSelectors = {
  theme: (state: ThemeStoreSlice) => state.theme,
  actions: (state: ThemeStoreSlice) => state.actions,
};
