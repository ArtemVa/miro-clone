import { useMemo } from 'react';
import type { FieldValues } from 'react-hook-form';

import { toFormServerErrors } from '@/shared/lib/helpers/form-server-errors';

/**
 * Ошибки сервера для `useForm({ errors })`: error — из useMutation, пересчёт только при новой ошибке.
 * При новом запросе error сбрасывается в null, и react-hook-form сам убирает старые ошибки
 */
export const useFormServerErrors = <Values extends FieldValues>(
  error: unknown,
  defaultValues: Values,
  fallbackMessage: string,
) => useMemo(() => toFormServerErrors(error, defaultValues, fallbackMessage), [defaultValues, error, fallbackMessage]);
