import type { User as UserDto } from '@repo/contracts';

import { API_URLS } from '@/shared/api/constants';
import { httpClient } from '@/shared/api/http-client';

import type { AuthRepository, AuthResponseDto, RefreshResponseDto } from './auth-repository.types';

export const authRepository: AuthRepository = {
  login({ params, config }) {
    return httpClient.post<AuthResponseDto>(API_URLS.auth.login, params, {
      ...config,
      skipAuthRefresh: true,
    });
  },

  register({ params, config }) {
    return httpClient.post<AuthResponseDto>(API_URLS.auth.register, params, {
      ...config,
      skipAuthRefresh: true,
    });
  },

  refresh(requestConfig) {
    return httpClient.post<RefreshResponseDto>(API_URLS.auth.refresh, undefined, {
      ...requestConfig?.config,
      skipAuthRefresh: true,
    });
  },

  logout(requestConfig) {
    return httpClient.post<void>(API_URLS.auth.logout, undefined, {
      ...requestConfig?.config,
      skipAuthRefresh: true,
    });
  },

  me(requestConfig) {
    return httpClient.get<UserDto>(API_URLS.auth.me, requestConfig?.config);
  },

  forgotPassword({ params, config }) {
    return httpClient.post<void>(API_URLS.auth.forgotPassword, params, {
      ...config,
      skipAuthRefresh: true,
    });
  },
};
