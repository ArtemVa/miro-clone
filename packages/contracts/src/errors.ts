import { z } from 'zod';

export const ErrorCodeSchema = z.enum(['VALIDATION_ERROR', 'BAD_REQUEST', 'NOT_FOUND', 'CONFLICT', 'INTERNAL_ERROR']);
export type ErrorCode = z.infer<typeof ErrorCodeSchema>;

export const ApiErrorSchema = z.object({
  code: ErrorCodeSchema,
  message: z.string(),
  issues: z
    .array(
      z.object({
        path: z.string(),
        message: z.string(),
      }),
    )
    .optional(),
});
export type ApiError = z.infer<typeof ApiErrorSchema>;
