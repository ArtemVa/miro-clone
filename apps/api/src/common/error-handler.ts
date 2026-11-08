import type { ApiError } from '@repo/contracts';
import type { ErrorRequestHandler, RequestHandler } from 'express';
import { HttpError } from './http-error';

export const notFoundHandler: RequestHandler = (_req, res) => {
  const body: ApiError = { code: 'NOT_FOUND', message: 'Route not found' };
  res.status(404).json(body);
};

// Четыре аргумента обязательны: по ним Express отличает обработчик ошибок от обычного middleware.
export const errorHandler: ErrorRequestHandler = (err, _req, res, _next) => {
  if (err instanceof HttpError) {
    const body: ApiError = { code: err.code, message: err.message };
    res.status(err.status).json(body);
    return;
  }

  // Ошибки express.json() (битый JSON, слишком большое тело) приходят со status 4xx
  if (isClientError(err)) {
    const body: ApiError = { code: 'BAD_REQUEST', message: err.message };
    res.status(err.status).json(body);
    return;
  }

  // pino-http запишет эту ошибку со стеком в строку запроса, отдельно логировать не нужно
  res.err = err instanceof Error ? err : new Error(String(err));
  const body: ApiError = { code: 'INTERNAL_ERROR', message: 'Internal server error' };
  res.status(500).json(body);
};

function isClientError(err: unknown): err is { status: number; message: string } {
  return (
    err instanceof Error && 'status' in err && typeof err.status === 'number' && err.status >= 400 && err.status < 500
  );
}
