import { useId, useState, type ReactNode } from 'react';
import { EyeIcon, EyeOffIcon } from 'lucide-react';

import type { Simplify } from '@/shared/lib/types/common';
import { Show } from '@/shared/ui/control-flow/show';
import { Button } from '@/shared/ui/primitives/button/button';
import { Field, FieldDescription, FieldError, FieldLabel } from '@/shared/ui/primitives/field';
import { Input } from '@/shared/ui/primitives/input';

import type { FormUIProps } from './types';

type PasswordFieldProps = Simplify<
  Omit<FormUIProps<'input'>, 'type'> & {
    /** Справа от подписи: например, ссылка «Забыли пароль?» */
    labelAction?: ReactNode;
    /** Под полем: подсказка или индикатор сложности */
    description?: ReactNode;
  }
>;

export const PasswordField = ({ label, labelAction, description, error, ...props }: PasswordFieldProps) => {
  const id = useId();
  const [isVisible, setIsVisible] = useState(false);

  return (
    <Field data-invalid={!!error}>
      <div className="flex items-center justify-between gap-2">
        <Show when={!!label}>
          <FieldLabel htmlFor={id}>{label}</FieldLabel>
        </Show>
        {labelAction}
      </div>

      <div className="relative">
        <Input id={id} type={isVisible ? 'text' : 'password'} aria-invalid={!!error} className="pr-10" {...props} />
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          className="absolute top-1/2 right-0.5 -translate-y-1/2 text-muted-foreground"
          aria-label={isVisible ? 'Скрыть пароль' : 'Показать пароль'}
          onClick={() => setIsVisible((value) => !value)}
        >
          <Show when={isVisible} fallback={<EyeIcon />}>
            <EyeOffIcon />
          </Show>
        </Button>
      </div>

      <Show when={!!description}>
        <FieldDescription>{description}</FieldDescription>
      </Show>
      <Show when={!!error}>
        <FieldError>{error}</FieldError>
      </Show>
    </Field>
  );
};
