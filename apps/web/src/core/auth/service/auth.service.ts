import { userAdapter, type User } from '@/entities/user';

import { authAdapter } from '../model/auth.adapter';
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

  async refreshToken(): Promise<string> {
    const { data } = await authRepository.refresh();
    return authAdapter.mapAccessToken(data);
  },

  async requestPasswordReset(input: ForgotPasswordInput): Promise<void> {
    await authRepository.forgotPassword({ params: input });
  },
};
