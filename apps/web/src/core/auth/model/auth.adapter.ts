import { userAdapter } from '@/entities/user';

import type { AuthResponseDto, RefreshResponseDto } from '../repository/auth-repository.types';
import { accessTokenSchema } from './auth.schema';
import type { Session } from './auth.types';

/** DTO auth → модель фронта. Пользователя переводит адаптер сущности: формат User знает только entities/user */
export const authAdapter = {
  mapSession(dto: AuthResponseDto): Session {
    return {
      accessToken: accessTokenSchema.parse(dto.accessToken),
      user: userAdapter.mapUser(dto.user),
    };
  },

  mapAccessToken(dto: RefreshResponseDto): string {
    return accessTokenSchema.parse(dto.accessToken);
  },
};
