import { useId } from 'react';
import { Checkbox as CheckboxPrimitive } from 'radix-ui';

import type { Simplify } from '@/shared/lib/types/common';
import { Show } from '@/shared/ui/control-flow/show';
import { Checkbox } from '@/shared/ui/primitives/checkbox';
import { Field, FieldError, FieldLabel } from '@/shared/ui/primitives/field';

import type { FieldOrientation, FormUIProps } from './types';

type CheckboxFieldProps = Simplify<
  {
    orientation?: FieldOrientation;
  } & FormUIProps<typeof CheckboxPrimitive.Root>
>;

export const CheckboxField = ({ label, orientation = 'horizontal', error, ...props }: CheckboxFieldProps) => {
  const id = useId();

  return (
    <Field orientation={orientation}>
      <Checkbox id={id} aria-invalid={!!error} {...props} />
      <Show when={!!label}>
        <FieldLabel htmlFor={id} className="font-normal">
          {label}
        </FieldLabel>
      </Show>
      <Show when={!!error}>
        <FieldError>{error}</FieldError>
      </Show>
    </Field>
  );
};
