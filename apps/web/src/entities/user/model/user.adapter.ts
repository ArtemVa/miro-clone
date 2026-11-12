import { UserSchema, type User as UserDto } from '@repo/contracts';

import type { User } from './user.types';

export const userAdapter = {
  mapUser(dto: UserDto): User {
    const { id, name, email, createdAt } = UserSchema.parse(dto);
    return { id, name, email, createdAt };
  },
};
