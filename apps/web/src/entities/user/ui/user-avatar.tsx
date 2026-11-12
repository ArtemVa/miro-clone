import type { ComponentProps } from 'react';

import type { Simplify } from '@/shared/lib/types/common';
import { Avatar, AvatarFallback } from '@/shared/ui/primitives/avatar';

import { userModel } from '../model/user.model';
import type { User } from '../model/user.types';

type UserAvatarProps = Simplify<
  {
    user: Pick<User, 'id' | 'name'>;
    className?: string;
  } & Pick<ComponentProps<typeof Avatar>, 'size'>
>;

export const UserAvatar = ({ user, size, className }: UserAvatarProps) => (
  <Avatar size={size} className={className} aria-hidden="true">
    <AvatarFallback className="font-semibold text-white" style={{ backgroundColor: userModel.getAvatarColor(user) }}>
      {userModel.getInitials(user)}
    </AvatarFallback>
  </Avatar>
);
