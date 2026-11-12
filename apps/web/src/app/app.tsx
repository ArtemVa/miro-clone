import { QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { RouterProvider } from 'react-router/dom';

import { FeatureFlagsDevtools } from '@/core/feature-flags';
import { queryClient } from '@/shared/api/query-client';
import { IS_DEV_MODE } from '@/shared/config/env/config';
import { Show } from '@/shared/ui/control-flow/show';

import { AppToaster } from './app-toaster';
import { AppDataLoader } from './app.loader';
import { router } from './router/router';

export const App = () => (
  <QueryClientProvider client={queryClient}>
    <AppToaster />
    <AppDataLoader>
      <RouterProvider router={router} />
      <Show when={IS_DEV_MODE}>
        <FeatureFlagsDevtools />
        <ReactQueryDevtools buttonPosition="bottom-right" />
      </Show>
    </AppDataLoader>
  </QueryClientProvider>
);
