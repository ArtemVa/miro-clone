import type { User as UserDto } from '@repo/contracts';

import type { ApiResponse, RequestConfig } from '@/shared/api/types';

import type { ForgotPasswordInput, LoginInput, RegisterInput } from '../model/auth.types';

/* ----- DTO: формат api. Наружу модуля не выходят, в модель фронта их переводит authAdapter ----- */

// TODO: заменить на схемы из @repo/contracts
export type AuthResponseDto = {
  accessToken: string;
  user: UserDto;
};

export type RefreshResponseDto = {
  accessToken: string;
};

export type AuthRepository = {
  login(requestConfig: RequestConfig<LoginInput>): ApiResponse<AuthResponseDto>;
  register(requestConfig: RequestConfig<RegisterInput>): ApiResponse<AuthResponseDto>;
  refresh(requestConfig?: RequestConfig): ApiResponse<RefreshResponseDto>;
  logout(requestConfig?: RequestConfig): ApiResponse<void>;
  me(requestConfig?: RequestConfig): ApiResponse<UserDto>;
  forgotPassword(requestConfig: RequestConfig<ForgotPasswordInput>): ApiResponse<void>;
};
