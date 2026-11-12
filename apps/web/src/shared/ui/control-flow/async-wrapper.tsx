import { type ReactNode } from 'react';

import { isDefAndNotNull } from '@/shared/lib/utils';
import { EmptyState } from '@/shared/ui/composables/empty-state';
import { Loader } from '@/shared/ui/composables/loader';
import { ErrorAlert } from '@/shared/ui/errors/error-alert';

type AsyncWrapperProps<Value> = {
  isLoading: boolean;
  isError: boolean;
  data: Value | null | undefined;
  children: (data: NonNullable<Value>) => ReactNode;
  loaderSlot?: ReactNode;
  errorSlot?: ReactNode;
  emptyDataSlot?: ReactNode;
};

const hasData = <Value,>(data: Value | null | undefined): data is NonNullable<Value> => {
  return isDefAndNotNull(data) && !(Array.isArray(data) && data.length === 0);
};

export const AsyncWrapper = <Value,>({
  children,
  data,
  isLoading,
  isError,
  loaderSlot = <Loader />,
  errorSlot = <ErrorAlert />,
  emptyDataSlot = <EmptyState />,
}: AsyncWrapperProps<Value>) => {
  if (isLoading) return loaderSlot;
  if (isError) return errorSlot;
  if (!hasData(data)) return emptyDataSlot;

  return children(data);
};
