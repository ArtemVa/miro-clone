import type { ComponentProps, ReactNode } from 'react';

import type { Simplify } from '@/shared/lib/types/common';
import { Popover, PopoverContent, PopoverTrigger } from '@/shared/ui/primitives/popover';

type UiPopoverProps = Simplify<
  {
    children: ReactNode;
    /** Должен быть фокусируемым элементом (button), чтобы popover открывался с клавиатуры */
    triggerSlot: ReactNode;
  } & ComponentProps<typeof Popover>
>;

export const UiPopover = ({ children, triggerSlot, ...props }: UiPopoverProps) => {
  return (
    <Popover {...props}>
      <PopoverTrigger asChild>{triggerSlot}</PopoverTrigger>
      <PopoverContent side="bottom" align="end" className="flex w-64 flex-col gap-4">
        {children}
      </PopoverContent>
    </Popover>
  );
};
