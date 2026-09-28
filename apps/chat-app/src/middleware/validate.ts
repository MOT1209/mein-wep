import type { NextFunction, Request, Response } from 'express';
import type { ZodSchema } from 'zod';
import { AppError, errors } from '../lib/errors.js';

type Source = 'body' | 'query' | 'params';

/**
 * Validates and REPLACES the request part with the parsed (typed) value so
 * handlers only ever see sanitized data.
 */
export function validate(schema: ZodSchema, source: Source = 'body') {
  return (req: Request, _res: Response, next: NextFunction): void => {
    const result = schema.safeParse(req[source]);
    if (!result.success) {
      const details: Record<string, string[]> = {};
      for (const issue of result.error.issues) {
        const key = issue.path.join('.') || source;
        (details[key] ??= []).push(issue.message);
      }
      next(errors.validation('Request validation failed.', details));
      return;
    }
    if (source === 'body') {
      req.body = result.data;
    } else {
      // Express 4 exposes req.query as a getter-only prototype property, so a
      // plain assignment throws in strict mode. Shadow it on the instance.
      Object.defineProperty(req, source, {
        value: result.data,
        writable: true,
        configurable: true,
        enumerable: true,
      });
    }
    next();
  };
}

export function assertFound<T>(value: T | null | undefined, message?: string): T {
  if (value === null || value === undefined) throw errors.notFound(message);
  return value;
}

export function rethrowAppError(err: unknown): AppError {
  if (err instanceof AppError) return err;
  return new AppError('INTERNAL_ERROR', 'Something went wrong.');
}
