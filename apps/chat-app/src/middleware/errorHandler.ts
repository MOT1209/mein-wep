import type { NextFunction, Request, Response } from 'express';
import { ZodError } from 'zod';
import { AppError, isAppError } from '../lib/errors.js';
import { logger } from '../lib/logger.js';
import { isTest } from '../config/env.js';

export function notFoundHandler(_req: Request, res: Response): void {
  res.status(404).json({
    error: { code: 'NOT_FOUND', message: 'Route not found.' },
  });
}

export function errorHandler(
  err: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction,
): void {
  let appError: AppError;

  if (isAppError(err)) {
    appError = err;
  } else if (err instanceof ZodError) {
    appError = new AppError('VALIDATION_ERROR', 'Request validation failed.');
  } else if (
    typeof err === 'object' &&
    err !== null &&
    'type' in err &&
    (err as { type?: string }).type === 'entity.too.large'
  ) {
    appError = new AppError('PAYLOAD_TOO_LARGE', 'Request body is too large.');
  } else if (
    typeof err === 'object' &&
    err !== null &&
    'code' in err &&
    (err as { code?: string }).code === '23505'
  ) {
    appError = new AppError('CONFLICT', 'That resource already exists.');
  } else {
    // Never leak internals (stack traces, SQL, driver messages) to the client.
    appError = new AppError('INTERNAL_ERROR', 'Something went wrong.');
    if (!isTest) {
      logger.error('unhandled error', {
        message: err instanceof Error ? err.message : String(err),
        stack: err instanceof Error ? err.stack?.split('\n').slice(0, 4).join(' | ') : undefined,
      });
    }
  }

  if (appError.status >= 500 && !isTest) {
    logger.error('server error', { code: appError.code, message: appError.message });
  }

  res.status(appError.status).json({
    error: {
      code: appError.code,
      message: appError.message,
      ...(appError.details ? { details: appError.details } : {}),
    },
  });
}
