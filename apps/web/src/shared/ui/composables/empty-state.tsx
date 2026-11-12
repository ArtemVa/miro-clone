import type { ReactNode } from 'react';
import { cn } from 'cn';
import { InboxIcon } from 'lucide-react';

import { Show } from '@/shared/ui/control-flow/show';

type EmptyStateProps = {
  title?: string;
  description?: string;
  icon?: ReactNode;
  action?: ReactNode;
  className?: string;
};

export const EmptyState = ({
  title = 'Ничего не найдено',
  description,
  icon = <InboxIcon />,
  action,
  className,
}: EmptyStateProps) => {
  return (
    <div
      className={cn(
        'flex h-full min-h-50 w-full flex-col items-center justify-center gap-3 px-4 text-center',
        className,
      )}
    >
      <div className="flex size-12 items-center justify-center rounded-2xl bg-muted text-muted-foreground [&_svg]:size-6">
        {icon}
      </div>

      <div className="flex flex-col gap-1">
        <p className="text-lg font-medium text-foreground">{title}</p>
        <Show when={!!description}>
          <p className="max-w-md text-sm text-muted-foreground">{description}</p>
        </Show>
      </div>

      {action}
    </div>
  );
};
