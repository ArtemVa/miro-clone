import { useWatch } from 'react-hook-form';

import { authModel, type RegisterFormValues, type RegisterInput } from '@/core/auth';
import type { FormReturn } from '@/shared/lib/types/form';
import { Spinner } from '@/shared/ui/composables/spinner';
import { UiAlert } from '@/shared/ui/composables/ui-alert';
import { Show } from '@/shared/ui/control-flow/show';
import { Form } from '@/shared/ui/form/form';
import { InputField } from '@/shared/ui/form/input-field';
import { PasswordField } from '@/shared/ui/form/password-field';
import { Button } from '@/shared/ui/primitives/button/button';

import { PasswordStrength } from './password-strength';

type RegisterFormProps = {
  form: FormReturn<RegisterFormValues, RegisterInput>;
  isPending: boolean;
  onSubmit: (values: RegisterInput) => void;
};

export const RegisterForm = ({ form, isPending, onSubmit }: RegisterFormProps) => {
  const password = useWatch({ control: form.control, name: 'password' });

  return (
    <Form className="flex flex-col gap-4" form={form} onSubmit={onSubmit}>
      {({ register, formState: { errors } }) => (
        <>
          <Show when={!!errors.root?.message}>
            <UiAlert variant="destructive" description={errors.root?.message} />
          </Show>

          <InputField
            autoComplete="name"
            label="Имя"
            placeholder="Аня Смирнова"
            error={errors.name?.message}
            {...register('name')}
          />

          <InputField
            type="email"
            autoComplete="email"
            label="Email"
            placeholder="anya@team.ru"
            error={errors.email?.message}
            {...register('email')}
          />

          <PasswordField
            autoComplete="new-password"
            label="Пароль"
            description={<PasswordStrength strength={authModel.getPasswordStrength(password)} />}
            error={errors.password?.message}
            {...register('password')}
          />

          <Button type="submit" className="w-full" disabled={isPending}>
            <Show when={isPending}>
              <Spinner />
            </Show>
            Создать аккаунт
          </Button>

          <p className="text-center text-xs text-muted-foreground">
            Нажимая кнопку, вы принимаете условия и политику конфиденциальности.
          </p>
        </>
      )}
    </Form>
  );
};
