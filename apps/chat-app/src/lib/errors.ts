export type ErrorCode =
  | 'VALIDATION_ERROR'
  | 'UNAUTHORIZED'
  | 'FORBIDDEN'
  | 'NOT_FOUND'
  | 'CONFLICT'
  | 'RATE_LIMITED'
  | 'PAYLOAD_TOO_LARGE'
  | 'INTERNAL_ERROR';

const STATUS_BY_CODE: Record<ErrorCode, number> = {
  VALIDATION_ERROR: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  RATE_LIMITED: 429,
  PAYLOAD_TOO_LARGE: 413,
  INTERNAL_ERROR: 500,
};

export class AppError extends Error {
  readonly code: ErrorCode;
  readonly status: number;
  readonly details?: Record<string, string[]>;

  constructor(
    code: ErrorCode,
    message: string,
    details?: Record<string, string[]>,
  ) {
    super(message);
    this.name = 'AppError';
    this.code = code;
    this.status = STATUS_BY_CODE[code];
    this.details = details;
  }
}

export const errors = {
  unauthorized: (message = 'Authentication required.') =>
    new AppError('UNAUTHORIZED', message),
  forbidden: (message = 'You do not have access to this resource.') =>
    new AppError('FORBIDDEN', message),
  notFound: (message = 'Resource not found.') => new AppError('NOT_FOUND', message),
  conflict: (message: string) => new AppError('CONFLICT', message),
  internal: (message = 'Something went wrong.') => new AppError('INTERNAL_ERROR', message),
  validation: (message: string, details?: Record<string, string[]>) =>
    new AppError('VALIDATION_ERROR', message, details),
};

export function isAppError(err: unknown): err is AppError {
  return err instanceof AppError;
}
