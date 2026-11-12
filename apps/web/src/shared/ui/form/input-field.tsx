import { useId } from 'react';

import { Show } from '@/shared/ui/control-flow/show';
import { Field, FieldError, FieldLabel } from '@/shared/ui/primitives/field';
import { Input } from '@/shared/ui/primitives/input';

import type { FormUIProps } from './types';

export const InputField = ({ label, error, ...props }: FormUIProps<'input'>) => {
  const id = useId();

  return (
    <Field data-invalid={!!error}>
      <Show when={!!label}>
        <FieldLabel htmlFor={id}>{label}</FieldLabel>
      </Show>
      <Input id={id} aria-invalid={!!error} {...props} />
      <Show when={!!error}>
        <FieldError>{error}</FieldError>
      </Show>
    </Field>
  );
};
