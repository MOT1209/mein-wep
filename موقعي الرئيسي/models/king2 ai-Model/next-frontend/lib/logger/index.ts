type LogLevel = 'debug' | 'info' | 'warn' | 'error';

const LOG_PRIORITY: Record<LogLevel, number> = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3,
};

const isDev = process.env.NODE_ENV !== 'production';

const COLORS: Record<LogLevel, string> = {
  debug: '\x1b[90m',
  info: '\x1b[36m',
  warn: '\x1b[33m',
  error: '\x1b[31m',
};

const RESET = '\x1b[0m';

export interface Logger {
  debug: (msg: string, ...args: unknown[]) => void;
  info: (msg: string, ...args: unknown[]) => void;
  warn: (msg: string, ...args: unknown[]) => void;
  error: (msg: string, ...args: unknown[]) => void;
  timing: <T>(label: string, fn: () => Promise<T>) => Promise<T>;
}

export type LogTimings = Record<string, number>;

export function createLogger(name: string): Logger {
  function log(level: LogLevel, msg: string, ...args: unknown[]) {
    const timestamp = new Date().toISOString();

    if (isDev) {
      const color = COLORS[level];
      const prefix = `${color}[${timestamp}] [${level.toUpperCase()}] [${name}]${RESET}`;
      const method = level === 'error'
        ? console.error
        : level === 'warn'
          ? console.warn
          : console.log;

      if (args.length > 0) {
        method(`${prefix} ${msg}`, ...args);
      } else {
        method(`${prefix} ${msg}`);
      }
    } else {
      const entry = JSON.stringify({
        timestamp,
        level,
        module: name,
        message: msg,
        ...(args.length > 0 ? { data: args } : {}),
      });

      if (level === 'error') {
        console.error(entry);
      } else {
        console.log(entry);
      }
    }
  }

  return {
    debug: (msg: string, ...args: unknown[]) => log('debug', msg, ...args),
    info: (msg: string, ...args: unknown[]) => log('info', msg, ...args),
    warn: (msg: string, ...args: unknown[]) => log('warn', msg, ...args),
    error: (msg: string, ...args: unknown[]) => log('error', msg, ...args),
    timing: async <T>(label: string, fn: () => Promise<T>): Promise<T> => {
      const start = performance.now();
      log('debug', `⏱ ${label} - starting`);
      try {
        const result = await fn();
        const elapsed = (performance.now() - start).toFixed(2);
        log('info', `⏱ ${label} - completed in ${elapsed}ms`);
        return result;
      } catch (err) {
        const elapsed = (performance.now() - start).toFixed(2);
        log('error', `⏱ ${label} - failed after ${elapsed}ms`, err);
        throw err;
      }
    },
  };
}

export function logError(
  logger: Logger,
  error: unknown,
  context?: Record<string, unknown>
): void {
  const details: Record<string, unknown> = {
    message: (error as Error)?.message || 'Unknown error',
    name: (error as Error)?.name || 'Error',
    stack: (error as Error)?.stack,
  };

  if (error && typeof error === 'object') {
    if ('provider' in error) {
      details.provider = (error as { provider: unknown }).provider;
    }
    if ('statusCode' in error) {
      details.statusCode = (error as { statusCode: unknown }).statusCode;
    }
    if ('rawError' in error) {
      const raw = (error as { rawError: unknown }).rawError;
      details.rawError = raw instanceof Error ? raw.message : raw;
    }
  }

  if (context) {
    details.context = context;
  }

  logger.error('Error details', details);
}

export function createLogContext(
  source: string,
  extra?: Record<string, unknown>
): Record<string, unknown> {
  return { source, ...extra };
}
