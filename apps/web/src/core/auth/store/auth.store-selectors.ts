import type { AuthStoreSlice } from './auth.store-types';

export const authStoreSelectors = {
  session: (state: AuthStoreSlice) => state.session,
  isAuthorized: (state: AuthStoreSlice) => state.session !== null,
  user: (state: AuthStoreSlice) => state.session?.user,
  accessToken: (state: AuthStoreSlice) => state.session?.accessToken,
  actions: (state: AuthStoreSlice) => state.actions,
};
