import { Navigate, Outlet, useLocation } from 'react-router';

import { ROUTES } from '@/shared/routes';

import { authModel } from '../model/auth.model';
import { authStore } from '../store/auth.store';
import { authStoreSelectors } from '../store/auth.store-selectors';

export const GuestRoute = () => {
  const isAuthorized = authStore.use(authStoreSelectors.isAuthorized);
  const location = useLocation();

  if (isAuthorized) {
    const redirectPath = authModel.getRedirectPath(location.state);

    return <Navigate to={redirectPath ?? ROUTES.BOARDS.path} replace />;
  }

  return <Outlet />;
};
