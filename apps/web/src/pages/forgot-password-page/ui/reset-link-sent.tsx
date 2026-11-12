import { MailCheckIcon } from 'lucide-react';
import { Link } from 'react-router';

import { ROUTES } from '@/shared/routes';
import { Spinner } from '@/shared/ui/composables/spinner';
import { Show } from '@/shared/ui/control-flow/show';
import { Button } from '@/shared/ui/primitives/button/button';

type ResetLinkSentProps = {
  email: string;
  isResending: boolean;
  onResend: () => void;
};

export const ResetLinkSent = ({ email, isResending, onResend }: ResetLinkSentProps) => (
  <section className="animate-fade-up text-center">
    <span className="mx-auto flex size-12 items-center justify-center rounded-full bg-primary/10 text-primary">
      <MailCheckIcon className="size-5" />
    </span>
    <h1 className="mt-5 text-2xl font-semibold tracking-tight">Проверьте почту</h1>
    <p className="mt-2 text-sm text-muted-foreground">
      Отправили ссылку на <b className="text-foreground">{email}</b>. Если письма нет — загляните в «Спам».
    </p>

    <Button type="button" variant="outline" className="mt-6 w-full" disabled={isResending} onClick={onResend}>
      <Show when={isResending}>
        <Spinner />
      </Show>
      Отправить ещё раз
    </Button>
    <Button asChild variant="ghost" className="mt-2 w-full">
      <Link to={ROUTES.AUTH.LOGIN.path}>Вернуться ко входу</Link>
    </Button>
  </section>
);
