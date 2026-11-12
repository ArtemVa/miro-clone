import { useId } from 'react';
import { RadioGroup as RadioGroupPrimitive } from 'radix-ui';

import type { Simplify } from '@/shared/lib/types/common';
import { Show } from '@/shared/ui/control-flow/show';
import { Field, FieldError } from '@/shared/ui/primitives/field';
import { Label } from '@/shared/ui/primitives/label';
import { RadioGroupItem } from '@/shared/ui/primitives/radio-group';

import type { FieldOrientation, FormUIProps } from './types';

type RadioFieldProps = Simplify<
  {
    orientation?: FieldOrientation;
  } & FormUIProps<typeof RadioGroupPrimitive.Item>
>;

export const RadioField = ({ label, orientation = 'horizontal', error, ...props }: RadioFieldProps) => {
  const id = useId();

  return (
    <Field orientation={orientation}>
      <RadioGroupItem id={id} {...props} />
      <Show when={!!label}>
        <Label htmlFor={id}>{label}</Label>
      </Show>
      <Show when={!!error}>
        <FieldError>{error}</FieldError>
      </Show>
    </Field>
  );
};
