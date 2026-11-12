import type { ComponentProps } from 'react';
import { cn } from 'cn';

import type { Simplify } from '@/shared/lib/types/common';
import { Skeleton } from '@/shared/ui/primitives/skeleton';

type SkeletonItemsProps = Simplify<
  {
    count?: number;
  } & ComponentProps<'ul'>
>;

const SkeletonItem = () => {
  return (
    <li>
      <div className="rounded-lg border border-border px-3 py-2.5">
        <div className="flex flex-col gap-1">
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-3 w-full" />
          <Skeleton className="h-3 w-2/3" />
        </div>
      </div>
    </li>
  );
};

export const SkeletonItems = ({ count = 5, className, ...props }: SkeletonItemsProps) => {
  return (
    <ul className={cn('flex flex-col gap-4', className)} {...props}>
      {Array.from({ length: count }, (_, index) => (
        <SkeletonItem key={index} />
      ))}
    </ul>
  );
};
