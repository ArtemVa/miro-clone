import type { BaseSyntheticEvent, ReactNode } from 'react';
import { FormProvider, type FieldValues, type UseFormReturn } from 'react-hook-form';

import { reportError } from '@/shared/lib/helpers/sentry-monitoring';

type FormProps<Input extends FieldValues, Output extends FieldValues> = {
  form: UseFormReturn<Input, unknown, Output>;
  children: (form: UseFormReturn<Input, unknown, Output>) => ReactNode;
  onSubmit?: (values: Output) => void | Promise<void>;
  className?: string;
};

export const Form = <Input extends FieldValues, Output extends FieldValues = Input>({
  children,
  form,
  className,
  onSubmit,
}: FormProps<Input, Output>) => {
  const handleSubmit =
    onSubmit &&
    ((event: BaseSyntheticEvent) =>
      form
        .handleSubmit(onSubmit)(event)
        // Сюда долетают только непойманные ошибки: ошибки запроса фасад показывает сам. Это баг — в мониторинг
        .catch(reportError));

  return (
    <FormProvider {...form}>
      <form noValidate className={className} onSubmit={handleSubmit}>
        {children(form)}
      </form>
    </FormProvider>
  );
};
