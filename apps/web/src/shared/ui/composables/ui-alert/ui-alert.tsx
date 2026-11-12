import type { ComponentProps, ReactNode } from 'react';
import { CircleAlertIcon, InfoIcon } from 'lucide-react';

import { Show } from '@/shared/ui/control-flow/show';
import { Alert, AlertDescription, AlertTitle } from '@/shared/ui/primitives/alert';

type UiAlertVariant = NonNullable<ComponentProps<typeof Alert>['variant']>;

type UiAlertProps = {
  variant?: UiAlertVariant;
  title?: ReactNode;
  description?: ReactNode;
  /** По умолчанию — иконка варианта */
  icon?: ReactNode;
  className?: string;
};

const DEFAULT_ICONS: Record<UiAlertVariant, ReactNode> = {
  default: <InfoIcon />,
  destructive: <CircleAlertIcon />,
};

export const UiAlert = ({
  variant = 'default',
  title,
  description,
  icon = DEFAULT_ICONS[variant],
  className,
}: UiAlertProps) => (
  <Alert variant={variant} className={className}>
    {icon}
    <Show when={!!title}>
      <AlertTitle>{title}</AlertTitle>
    </Show>
    <Show when={!!description}>
      <AlertDescription>{description}</AlertDescription>
    </Show>
  </Alert>
);
