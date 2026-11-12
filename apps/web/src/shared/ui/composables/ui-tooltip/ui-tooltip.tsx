import type { ComponentProps, ReactNode } from 'react';

import type { Simplify } from '@/shared/lib/types/common';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/shared/ui/primitives/tooltip';

type UiTooltipProps = Simplify<
  {
    /** Текст подсказки */
    children: ReactNode;
    /** Должен быть фокусируемым элементом (button, a): подсказка открывается и наведением, и фокусом с клавиатуры */
    triggerSlot: ReactNode;
  } & Pick<ComponentProps<typeof TooltipContent>, 'side' | 'align' | 'className'>
>;

/** Подсказка к элементу. TooltipProvider с общей задержкой подключён один раз в App */
export const UiTooltip = ({ children, triggerSlot, side = 'top', align, className }: UiTooltipProps) => (
  <Tooltip>
    <TooltipTrigger asChild>{triggerSlot}</TooltipTrigger>
    <TooltipContent side={side} align={align} sideOffset={4} className={className}>
      {children}
    </TooltipContent>
  </Tooltip>
);
