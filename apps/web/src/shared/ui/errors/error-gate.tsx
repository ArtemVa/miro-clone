import { type ReactNode } from 'react';

import { Show } from '@/shared/ui/control-flow/show';

import { ErrorAlert } from './error-alert';

type ErrorGateProps = {
  isError: boolean;
  errorSlot?: ReactNode;
  children: ReactNode;
};

export const ErrorGate = ({ isError, errorSlot = <ErrorAlert />, children }: ErrorGateProps) => {
  return (
    <Show when={!isError} fallback={errorSlot}>
      {children}
    </Show>
  );
};
