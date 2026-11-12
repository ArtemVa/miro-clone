import { ArrowLeftIcon } from 'lucide-react';
import { Link } from 'react-router';

import { AuthFormLayout } from '@/core/auth';
import { ROUTES } from '@/shared/routes';
import { Show } from '@/shared/ui/control-flow/show';
import { Button } from '@/shared/ui/primitives/button/button';

import { useForgotPasswordPageFacade } from './model/use-forgot-password-page-facade';
import { ForgotPasswordForm } from './ui/forgot-password-form';
import { ResetLinkSent } from './ui/reset-link-sent';

export const ForgotPasswordPage = () => {
  const { form, sentTo, isPending, isResending, handleSubmit, handleResend } = useForgotPasswordPageFacade();

  return (
    <Show
      when={!!sentTo}
      data={sentTo}
      fallback={
        <>
          <Button asChild variant="ghost" size="sm" className="mb-4 -ml-2 text-muted-foreground">
            <Link to={ROUTES.AUTH.LOGIN.path}>
              <ArrowLeftIcon />
              Ко входу
            </Link>
          </Button>
          <AuthFormLayout
            title="Восстановление пароля"
            description="Пришлём ссылку для сброса. Она действует 30 минут."
          >
            <ForgotPasswordForm form={form} isPending={isPending} onSubmit={handleSubmit} />
          </AuthFormLayout>
        </>
      }
    >
      {(email) => <ResetLinkSent email={email ?? ''} isResending={isResending} onResend={handleResend} />}
    </Show>
  );
};
