import type { ComponentProps, ReactNode } from 'react';
import { cn } from 'cn';

import type { Simplify } from '@/shared/lib/types/common';
import { Show } from '@/shared/ui/control-flow/show';
import { FieldError, FieldLegend, FieldSet } from '@/shared/ui/primitives/field';

type RadioGroupFieldset = Simplify<
  {
    label: string;
    children: ReactNode;
    labelClassname?: string;
    error?: string;
  } & ComponentProps<'fieldset'>
>;

export function RadioGroupFieldset({
  children,
  className,
  label,
  labelClassname,
  error,
  ...props
}: RadioGroupFieldset) {
  return (
    <FieldSet {...props} className={cn('w-full max-w-xs', className)}>
      <FieldLegend className={labelClassname} variant="label">
        {label}
      </FieldLegend>
      {children}
      <Show when={!!error}>
        <FieldError>{error}</FieldError>
      </Show>
    </FieldSet>
  );
}
