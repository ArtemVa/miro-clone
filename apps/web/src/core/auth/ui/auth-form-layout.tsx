import type { ReactNode } from 'react';

import { Show } from '@/shared/ui/control-flow/show';

type AuthFormLayoutProps = {
  title: ReactNode;
  description?: ReactNode;
  children: ReactNode;
  footer?: ReactNode;
};

export const AuthFormLayout = ({ title, description, children, footer }: AuthFormLayoutProps) => (
  <section className="animate-fade-up">
    <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
    <Show when={!!description}>
      <p className="mt-1.5 text-sm text-muted-foreground">{description}</p>
    </Show>

    <div className="mt-6">{children}</div>

    <Show when={!!footer}>
      <div className="mt-6">{footer}</div>
    </Show>
  </section>
);
