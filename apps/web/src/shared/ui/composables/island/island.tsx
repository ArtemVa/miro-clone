import type { ComponentProps } from 'react';
import { cn } from 'cn';

export const Island = ({ className, ...props }: ComponentProps<'div'>) => (
  <div data-slot="island" className={cn('island flex items-center gap-1 p-1', className)} {...props} />
);
