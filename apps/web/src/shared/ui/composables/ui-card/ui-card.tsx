import type { ComponentProps, ReactNode } from 'react';

import type { Simplify } from '@/shared/lib/types/common';
import { Show } from '@/shared/ui/control-flow/show';
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/shared/ui/primitives/card';

type UiCardProps = Simplify<
  {
    title?: ReactNode;
    description?: ReactNode;
    /** Справа от заголовка: кнопка, меню */
    action?: ReactNode;
    footer?: ReactNode;
    children?: ReactNode;
    contentClassName?: string;
  } & Omit<ComponentProps<typeof Card>, 'title' | 'children'>
>;

export const UiCard = ({ title, description, action, footer, children, contentClassName, ...props }: UiCardProps) => (
  <Card {...props}>
    <Show when={!!title || !!description || !!action}>
      <CardHeader>
        <Show when={!!title}>
          <CardTitle>{title}</CardTitle>
        </Show>
        <Show when={!!description}>
          <CardDescription>{description}</CardDescription>
        </Show>
        <Show when={!!action}>
          <CardAction>{action}</CardAction>
        </Show>
      </CardHeader>
    </Show>

    <Show when={!!children}>
      <CardContent className={contentClassName}>{children}</CardContent>
    </Show>

    <Show when={!!footer}>
      <CardFooter>{footer}</CardFooter>
    </Show>
  </Card>
);
