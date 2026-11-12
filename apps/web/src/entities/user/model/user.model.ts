import { PRESENCE_COUNT, presenceColor } from '@/shared/config/board';

import type { User } from './user.types';

export const userModel = {
  getInitials(user: Pick<User, 'name'>): string {
    return user.name
      .trim()
      .split(/\s+/)
      .slice(0, 2)
      .map((word) => word[0] ?? '')
      .join('')
      .toUpperCase();
  },

  /** Цвет аватара из палитры presence: один и тот же для пользователя на любом устройстве */
  getAvatarColor(user: Pick<User, 'id'>): string {
    const hash = [...user.id].reduce((sum, char) => sum + char.charCodeAt(0), 0);
    return presenceColor(hash % PRESENCE_COUNT);
  },
};
