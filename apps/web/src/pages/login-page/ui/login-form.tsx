import { Link } from 'react-router';

import type { LoginFormValues, LoginInput } from '@/core/auth';
import type { FormReturn } from '@/shared/lib/types/form';
import { ROUTES } from '@/shared/routes';
import { Spinner } from '@/shared/ui/composables/spinner';
import { UiAlert } from '@/shared/ui/composables/ui-alert';
import { Show } from '@/shared/ui/control-flow/show';
import { Form } from '@/shared/ui/form/form';
import { InputField } from '@/shared/ui/form/input-field';
import { PasswordField } from '@/shared/ui/form/password-field';
import { Button } from '@/shared/ui/primitives/button/button';

type LoginFormProps = {
  form: FormReturn<LoginFormValues, LoginInput>;
  isPending: boolean;
  onSubmit: (values: LoginInput) => void;
};

export const LoginForm = ({ form, isPending, onSubmit }: LoginFormProps) => (
  <Form className="flex flex-col gap-4" form={form} onSubmit={onSubmit}>
    {({ register, formState: { errors } }) => (
      <>
        <Show when={!!errors.root?.message}>
          <UiAlert variant="destructive" description={errors.root?.message} />
        </Show>

        <InputField
          type="email"
          autoComplete="email"
          label="Email"
          placeholder="anya@team.ru"
          error={errors.email?.message}
          {...register('email')}
        />

        <PasswordField
          autoComplete="current-password"
          label="Пароль"
          labelAction={
            <Link to={ROUTES.AUTH.FORGOT_PASSWORD.path} className="text-xs text-muted-foreground hover:text-foreground">
              Забыли пароль?
            </Link>
          }
          error={errors.password?.message}
          {...register('password')}
        />

        <Button type="submit" className="w-full" disabled={isPending}>
          <Show when={isPending}>
            <Spinner />
          </Show>
          Войти
        </Button>
      </>
    )}
  </Form>
);
