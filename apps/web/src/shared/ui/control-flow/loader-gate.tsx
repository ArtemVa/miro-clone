import { type ReactNode } from 'react';

import { Loader } from '@/shared/ui/composables/loader';

import { Show } from './show';

type LoaderGateProps = {
  isLoading: boolean;
  loaderSlot?: ReactNode;
  children: ReactNode;
};

export const LoaderGate = ({ isLoading, loaderSlot = <Loader />, children }: LoaderGateProps) => {
  return (
    <Show when={!isLoading} fallback={loaderSlot}>
      {children}
    </Show>
  );
};
