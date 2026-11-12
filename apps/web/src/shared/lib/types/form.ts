import type { FieldValues, UseFormReturn } from 'react-hook-form';

export type FormReturn<Input extends FieldValues, Output extends FieldValues = Input> = UseFormReturn<
  Input,
  unknown,
  Output
>;
