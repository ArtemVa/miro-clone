import type { RouteObject } from 'react-router';

import { GuestRoute } from '@/core/auth';
import { ROUTES } from '@/shared/routes';

import { AuthLayout } from '../../layouts/auth-layout';

export const authRoutes: RouteObject = {
  element: <GuestRoute />,
  children: [
    {
      element: <AuthLayout />,
      children: [
        {
          path: ROUTES.AUTH.LOGIN.path,
          lazy: () => import('@/pages/login-page'),
        },
        {
          path: ROUTES.AUTH.REGISTER.path,
          lazy: () => import('@/pages/register-page'),
        },
        {
          path: ROUTES.AUTH.FORGOT_PASSWORD.path,
          lazy: () => import('@/pages/forgot-password-page'),
        },
      ],
    },
  ],
};
