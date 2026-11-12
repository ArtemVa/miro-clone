import { userAdapter, type User } from '@/entities/user';
import { getApiErrorStatus } from '@/shared/api/http-client';

import { authAdapter } from '../model/auth.adapter';
import { authModel } from '../model/auth.model';
import type { ForgotPasswordInput, LoginInput, RegisterInput, Session } from '../model/auth.types';
import { authRepository } from '../repository/auth.repository';

export const authService = {
  async signIn(input: LoginInput): Promise<Session> {
    const { data } = await authRepository.login({ params: input });
    return authAdapter.mapSession(data);
  },

  async register(input: RegisterInput): Promise<Session> {
    const { data } = await authRepository.register({ params: input });
    return authAdapter.mapSession(data);
  },

  async signOut(): Promise<void> {
    await authRepository.logout().catch(() => undefined);
  },

  async getMe(): Promise<User> {
    const { data } = await authRepository.me();
    return userAdapter.mapUser(data);
  },

  /**
   * Сессия по refresh-cookie, когда сохранённой сессии в браузере нет: например, localStorage очистили.
   * null — гость: refresh-cookie нет или она протухла
   */
  async restoreSessionByCookie(): Promise<Session | null> {
    let accessToken: string;

    try {
      const { data } = await authRepository.refresh();
      accessToken = authAdapter.mapAccessToken(data);
    } catch (error) {
      if (getApiErrorStatus(error) === 401) return null;
      throw error;
    }

    // Токена ещё нет в сторе, поэтому request-интерцептор его не подставит: передаём явно
    const { data } = await authRepository.me({
      config: { headers: { Authorization: authModel.toAuthorizationHeader(accessToken) } },
    });

    return { accessToken, user: userAdapter.mapUser(data) };
  },

  async refreshToken(): Promise<string> {
    const { data } = await authRepository.refresh();
    return authAdapter.mapAccessToken(data);
  },

  async requestPasswordReset(input: ForgotPasswordInput): Promise<void> {
    await authRepository.forgotPassword({ params: input });
  },
};
