import type { ComponentProps, ReactNode } from 'react';

import type { Simplify } from '@/shared/lib/types/common';
import { HoverCard, HoverCardContent, HoverCardTrigger } from '@/shared/ui/primitives/hover-card';

type UiHoverCardProps = Simplify<
  {
    children: ReactNode;
    triggerSlot: ReactNode;
  } & ComponentProps<typeof HoverCard>
>;

export const UiHoverCard = ({ children, triggerSlot, ...props }: UiHoverCardProps) => {
  return (
    <HoverCard {...props}>
      <HoverCardTrigger className="cursor-pointer" asChild>
        {triggerSlot}
      </HoverCardTrigger>
      <HoverCardContent side="bottom" align="end" className="flex w-64 flex-col gap-4">
        {children}
      </HoverCardContent>
    </HoverCard>
  );
};
