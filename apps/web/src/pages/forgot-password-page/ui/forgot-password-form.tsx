import type { ForgotPasswordFormValues, ForgotPasswordInput } from '@/core/auth';
import type { FormReturn } from '@/shared/lib/types/form';
import { Spinner } from '@/shared/ui/composables/spinner';
import { Show } from '@/shared/ui/control-flow/show';
import { Form } from '@/shared/ui/form/form';
import { InputField } from '@/shared/ui/form/input-field';
import { Button } from '@/shared/ui/primitives/button/button';

type ForgotPasswordFormProps = {
  form: FormReturn<ForgotPasswordFormValues, ForgotPasswordInput>;
  isPending: boolean;
  onSubmit: (values: ForgotPasswordInput) => void;
};

export const ForgotPasswordForm = ({ form, isPending, onSubmit }: ForgotPasswordFormProps) => (
  <Form className="flex flex-col gap-4" form={form} onSubmit={onSubmit}>
    {({ register, formState: { errors } }) => (
      <>
        <InputField
          type="email"
          autoComplete="email"
          label="Email"
          placeholder="anya@team.ru"
          error={errors.email?.message ?? errors.root?.message}
          {...register('email')}
        />

        <Button type="submit" className="w-full" disabled={isPending}>
          <Show when={isPending}>
            <Spinner />
          </Show>
          Отправить ссылку
        </Button>
      </>
    )}
  </Form>
);
