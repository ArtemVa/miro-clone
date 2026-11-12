import { useState, type ReactNode } from 'react';

import { authStore, setupAuthInterceptors } from '@/core/auth';
import { featureFlagsStore } from '@/core/feature-flags';
import { useMount } from '@/shared/lib/hooks/use-mount';
import { LoaderScreen } from '@/shared/ui/composables/loader-screen';
import { LoaderGate } from '@/shared/ui/control-flow/loader-gate';

type AppDataLoaderProps = {
  children: ReactNode;
};

/** Глобальный загрузчик данных, нужных до рендера всего приложения: фича-флаги и сессия */
export const AppDataLoader = ({ children }: AppDataLoaderProps) => {
  const [isAppLoading, setIsAppLoading] = useState<boolean>(true);

  useMount(() => {
    const ejectAuthInterceptors = setupAuthInterceptors();

    void Promise.allSettled([
      featureFlagsStore.getState().actions.fetchFeatureFlags(),
      authStore.getState().actions.restoreSession(),
    ]).finally(() => setIsAppLoading(false));

    return ejectAuthInterceptors;
  });

  return (
    <LoaderGate isLoading={isAppLoading} loaderSlot={<LoaderScreen title="Загружаем Tandem" />}>
      {children}
    </LoaderGate>
  );
};
