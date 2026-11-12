import type { FieldError, FieldErrors, FieldValues } from 'react-hook-form';

import { getApiError } from '@/shared/api/http-client';

/**
 * Ошибка запроса → ошибки формы для `useForm({ errors })`.
 * issues по полям формы — на поля, issues по чужим полям и ошибка без issues — в root (алерт над формой).
 * shortcut: только плоские формы (path = имя поля), для вложенных полей понадобится set по пути
 */
export const toFormServerErrors = <Values extends FieldValues>(
  error: unknown,
  defaultValues: Values,
  fallbackMessage: string,
): FieldErrors<Values> | undefined => {
  if (!error) return undefined;

  const apiError = getApiError(error);
  const errors: Record<string, FieldError> = {};
  const otherMessages: string[] = [];

  for (const { path, message } of apiError?.issues ?? []) {
    if (Object.hasOwn(defaultValues, path)) {
      errors[path] = { type: 'server', message };
    } else {
      otherMessages.push(message);
    }
  }

  if (otherMessages.length || !Object.keys(errors).length) {
    errors.root = { type: 'server', message: otherMessages.join('. ') || apiError?.message || fallbackMessage };
  }

  // Ключи пришли с сервера, но выше оставили только поля формы
  return errors as FieldErrors<Values>;
};
