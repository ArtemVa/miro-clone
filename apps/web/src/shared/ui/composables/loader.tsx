import { cn } from 'cn';

import { Spinner, type SpinnerProps } from './spinner';

type LoaderProps = {
  className?: string;
  variant?: SpinnerProps['variant'];
};

export const Loader = ({ className, variant }: LoaderProps) => {
  return (
    <div
      role="status"
      aria-busy="true"
      className={cn('flex h-full min-h-50 w-full items-center justify-center', className)}
    >
      <Spinner variant={variant} />
    </div>
  );
};
