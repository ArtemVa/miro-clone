import { ErrorBoundary } from 'react-error-boundary';
import { createBrowserRouter, Outlet } from 'react-router';

import { ROUTES } from '@/shared/routes';
import { Loader } from '@/shared/ui/composables/loader';

import { LandingLayout } from '../layouts/landing-layout';
import { RootErrorFallback, RouteErrorFallback } from './root-error-fallback';
import { authRoutes } from './routes/auth.routes';
import { privateRoutes } from './routes/private.routes';

export const router = createBrowserRouter([
  {
    element: (
      <ErrorBoundary FallbackComponent={RootErrorFallback}>
        <Outlet />
      </ErrorBoundary>
    ),
    errorElement: <RouteErrorFallback />,
    hydrateFallbackElement: <Loader />,
    children: [
      authRoutes,
      privateRoutes,
      {
        element: <LandingLayout />,
        children: [
          {
            path: ROUTES.LANDING.path,
            lazy: () => import('@/pages/landing-page'),
          },
        ],
      },
      {
        path: ROUTES.NOT_FOUND.path,
        lazy: () => import('@/pages/not-found-page'),
      },
    ],
  },
]);
