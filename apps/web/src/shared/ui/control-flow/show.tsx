import { type ReactNode } from 'react';

export const Show = <Data,>({
  data,
  when,
  children,
  fallback = null,
}: {
  data?: Data;
  when: boolean;
  children: ReactNode | ((data: Data, when: boolean) => ReactNode);
  fallback?: ReactNode;
}) => {
  if (!when) return fallback;

  return typeof children === 'function' ? children(data as Data, when) : children;
};
