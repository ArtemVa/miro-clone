import type { ComponentProps } from 'react';
import { cn } from 'cn';

import type { StickyColor } from '@/shared/config/board';
import type { Simplify } from '@/shared/lib/types/common';

// Имена классов целиком: Tailwind ищет классы в исходниках как строки и не увидит `bg-sticky-${color}`
const COLOR_CLASSES: Record<StickyColor, string> = {
  yellow: 'bg-sticky-yellow',
  green: 'bg-sticky-green',
  blue: 'bg-sticky-blue',
  pink: 'bg-sticky-pink',
  orange: 'bg-sticky-orange',
  purple: 'bg-sticky-purple',
  gray: 'bg-sticky-gray',
  white: 'bg-sticky-white',
};

type StickyNoteProps = Simplify<
  {
    color?: StickyColor;
  } & ComponentProps<'div'>
>;

/**
 * Стикер — только внешний вид: цвет, тень, текст.
 * Стикер на доске (позиция, автор, редактирование) соберут entities и features, отрисовав этот компонент
 */
export const StickyNote = ({ color = 'yellow', className, ...props }: StickyNoteProps) => (
  <div className={cn('sticky-note p-3 text-sm', COLOR_CLASSES[color], className)} {...props} />
);
