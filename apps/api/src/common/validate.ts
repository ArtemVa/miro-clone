import type { ApiError } from '@repo/contracts';
import type { RequestHandler, Response } from 'express';
import { z } from 'zod';

// Параметры пути вида /:id. id в базе — uuid: без проверки строка вроде "abc" дошла бы до Postgres и дала 500.
export const IdParamsSchema = z.object({ id: z.uuid() });

// Проверяет req.params по схеме. Ошибка — 400 в формате ApiError.
export function validateParams<S extends z.ZodType<Record<string, string>>>(schema: S): RequestHandler<z.output<S>> {
  return (req, res, next) => {
    const result = schema.safeParse(req.params);

    if (!result.success) {
      sendValidationError(res, 'Path parameters do not match the contract', result.error);
      return;
    }

    req.params = result.data;
    next();
  };
}

// Проверяет req.body по схеме из contracts.
// Ошибка — сразу 400 в формате ApiError; успех — req.body заменяется результатом парсинга
// (уже с trim, дефолтами и без лишних полей).
// Тип body в ручке берётся из схемы: объявить в ручке другой тип TypeScript не даст.
export function validateBody<S extends z.ZodType>(
  schema: S,
): RequestHandler<Record<string, string>, unknown, z.output<S>> {
  return (req, res, next) => {
    const result = schema.safeParse(req.body);

    if (!result.success) {
      sendValidationError(res, 'Request body does not match the contract', result.error);
      return;
    }

    req.body = result.data;
    next();
  };
}

// То же для query-параметров. В Express 5 req.query — геттер, присвоить в него нельзя,
// поэтому результат кладём собственным свойством запроса: оно перекрывает геттер,
// и в ручке req.query уже с числами и дефолтами.
// Тип query в ручке берётся из схемы: объявить в ручке другой тип TypeScript не даст.
export function validateQuery<S extends z.ZodType>(
  schema: S,
): RequestHandler<Record<string, string>, unknown, unknown, z.output<S>> {
  return (req, res, next) => {
    const result = schema.safeParse(req.query);

    if (!result.success) {
      sendValidationError(res, 'Query parameters do not match the contract', result.error);
      return;
    }

    Object.defineProperty(req, 'query', { value: result.data, writable: true, configurable: true, enumerable: true });
    next();
  };
}

function sendValidationError(res: Response, message: string, error: z.ZodError): void {
  const body: ApiError = {
    code: 'VALIDATION_ERROR',
    message,
    issues: error.issues.map((issue) => ({
      path: issue.path.map(String).join('.'),
      message: issue.message,
    })),
  };
  res.status(400).json(body);
}
