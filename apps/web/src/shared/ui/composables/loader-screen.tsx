import { Show } from '@/shared/ui/control-flow/show';

import { Spinner } from './spinner';

type LoaderScreenProps = {
  title?: string;
};

export const LoaderScreen = ({ title }: LoaderScreenProps) => {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-6">
      <div className="flex w-full max-w-sm flex-col items-center gap-6 rounded-3xl border bg-card/80 p-8 text-center shadow-sm backdrop-blur-sm">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-primary">
          <Spinner variant="ring" size={36} />
        </div>

        <Show when={!!title}>
          <p className="text-lg font-semibold text-foreground">{title}</p>
        </Show>

        <div className="w-full space-y-3">
          <div className="h-2 w-full animate-pulse rounded-full bg-muted" />
          <div className="h-2 w-5/6 animate-pulse rounded-full bg-muted [animation-delay:120ms]" />
          <div className="h-2 w-2/3 animate-pulse rounded-full bg-muted [animation-delay:240ms]" />
        </div>
      </div>
    </div>
  );
};
