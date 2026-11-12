import type { ComponentProps, ReactNode } from 'react';
import { cn } from 'cn';

import type { Simplify } from '@/shared/lib/types/common';

type ListProps<Data extends { id: number | string }> = Simplify<
  {
    data: Data[];
    renderData: (item: Data, idx: number) => ReactNode;
  } & ComponentProps<'ul'>
>;

export const List = <Data extends { id: number | string }>({
  data,
  renderData,
  className,
  ...props
}: ListProps<Data>) => {
  return (
    <ul className={cn('list-none', className)} {...props}>
      {data.map((item, idx) => (
        <li key={item.id}>{renderData(item, idx)}</li>
      ))}
    </ul>
  );
};
