import type { ComponentProps, JSX, JSXElementConstructor } from 'react';
import type { FieldValues, UseFormProps } from 'react-hook-form';

import type { Simplify } from '@/shared/lib/types/common';

export type FormOptions<FormValues extends FieldValues> = Omit<UseFormProps<FormValues>, 'resolver'>;

export type FormUIProps<
  // eslint-disable-next-line @typescript-eslint/no-explicit-any -- нужен любой компонент
  Element extends keyof JSX.IntrinsicElements | JSXElementConstructor<any>,
> = Simplify<
  {
    label?: string;
    error?: string;
  } & ComponentProps<Element>
>;

export type FieldOrientation = 'vertical' | 'horizontal' | 'responsive';
