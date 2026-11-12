import type { RouteObject } from 'react-router';

import { PrivateRoute } from '@/core/auth';
import { ROUTES } from '@/shared/routes';

import { AppLayout } from '../../layouts/app-layout';

/** Страницы только для авторизованных. Гостя PrivateRoute отправит на вход и вернёт обратно */
export const privateRoutes: RouteObject = {
  element: <PrivateRoute />,
  children: [
    {
      element: <AppLayout />,
      children: [
        {
          path: ROUTES.BOARDS.path,
          lazy: () => import('@/pages/boards-page'),
        },
        {
          path: ROUTES.SETTINGS.path,
          lazy: () => import('@/pages/settings-page'),
        },
      ],
    },
  ],
};
