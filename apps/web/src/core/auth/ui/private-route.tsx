import { Navigate, Outlet, useLocation } from 'react-router';

import { ROUTES } from '@/shared/routes';

import { authStore } from '../store/auth.store';
import { authStoreSelectors } from '../store/auth.store-selectors';

export const PrivateRoute = () => {
  const isAuthorized = authStore.use(authStoreSelectors.isAuthorized);
  const location = useLocation();

  if (!isAuthorized) {
    return <Navigate to={ROUTES.AUTH.LOGIN.path} state={{ from: location }} replace />;
  }

  return <Outlet />;
};
