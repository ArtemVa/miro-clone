import type { ComponentProps } from 'react';
import { cn } from 'cn';

import type { Simplify } from '@/shared/lib/types/common';

import { SkeletonCard } from './skeleton-card';

type SkeletonList = Simplify<
  {
    count?: number;
  } & ComponentProps<'ul'>
>;

export const SkeletonList = ({ count = 5, className, ...props }: SkeletonList) => {
  return (
    <ul className={cn('grid grid-cols-1 md:grid-cols-4 gap-4 mt-4', className)} {...props}>
      {Array.from({ length: count }, (_, index) => (
        <SkeletonCard key={index} />
      ))}
    </ul>
  );
};
