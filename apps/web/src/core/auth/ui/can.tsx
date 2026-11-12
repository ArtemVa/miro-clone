import type { ReactNode } from 'react';

import type { Simplify } from '@/shared/lib/types/common';
import { Show } from '@/shared/ui/control-flow/show';

type CanBaseProps = {
  can: () => boolean;
  not?: boolean;
  fallback?: ReactNode;
};

type CanPassThroughProps = Simplify<
  CanBaseProps & {
    passThrough: true;
    children: (allowed: boolean) => ReactNode;
  }
>;

type CanNoPassThroughProps = Simplify<
  CanBaseProps & {
    passThrough?: false;
    children: ReactNode;
  }
>;

type CanProps = CanPassThroughProps | CanNoPassThroughProps;

export const Can = ({ can, not = false, fallback = null, children, passThrough }: CanProps) => {
  const allowed = can();
  const shouldRender = not ? !allowed : allowed;

  if (passThrough) {
    return children(shouldRender);
  }

  return (
    <Show when={shouldRender} fallback={fallback}>
      {children}
    </Show>
  );
};
