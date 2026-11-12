import { cn } from 'cn';

import type { User } from '../model/user.types';
import { UserAvatar } from './user-avatar';

type UserInfoProps = {
  user: User;
  className?: string;
};

/** Аватар, имя и email в строку: карточка профиля, кнопка меню пользователя */
export const UserInfo = ({ user, className }: UserInfoProps) => (
  <span className={cn('flex min-w-0 items-center gap-2.5', className)}>
    <UserAvatar user={user} />
    <span className="min-w-0 flex-1 text-left">
      <span className="block truncate text-sm font-medium">{user.name}</span>
      <span className="block truncate text-xs text-muted-foreground">{user.email}</span>
    </span>
  </span>
);
