import { useId } from 'react';

import { Show } from '@/shared/ui/control-flow/show';
import { Field, FieldError, FieldLabel } from '@/shared/ui/primitives/field';
import { Textarea } from '@/shared/ui/primitives/textarea';

import type { FormUIProps } from './types';

export const TextareaField = ({ label, error, ...props }: FormUIProps<'textarea'>) => {
  const id = useId();

  return (
    <Field data-invalid={!!error}>
      <Show when={!!label}>
        <FieldLabel htmlFor={id}>{label}</FieldLabel>
      </Show>
      <Textarea id={id} aria-invalid={!!error} {...props} />
      <Show when={!!error}>
        <FieldError>{error}</FieldError>
      </Show>
    </Field>
  );
};
