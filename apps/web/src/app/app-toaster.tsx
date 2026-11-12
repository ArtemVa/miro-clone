import { Toaster } from 'sonner';

import { themeStore, themeStoreSelectors } from '@/core/theme';

export const AppToaster = () => {
  const theme = themeStore.use(themeStoreSelectors.theme);

  return <Toaster theme={theme} richColors closeButton position="top-right" />;
};
