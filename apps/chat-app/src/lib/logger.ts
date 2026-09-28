import { env, isTest } from '../config/env.js';

type Level = 'debug' | 'info' | 'warn' | 'error';
const ORDER: Record<string, number> = {
  silent: 100,
  error: 40,
  warn: 30,
  info: 20,
  debug: 10,
};

const threshold: number = ORDER[env.LOG_LEVEL] ?? 20;

function write(level: Level, msg: string, meta?: Record<string, unknown>): void {
  if (env.LOG_LEVEL === 'silent') return;
  if ((ORDER[level] ?? 0) < threshold) return;
  const line = `[${level}] ${msg}`;
  if (meta && Object.keys(meta).length) {
    console[level === 'debug' ? 'log' : level](line, meta);
  } else {
    console[level === 'debug' ? 'log' : level](line);
  }
}

export const logger = {
  debug: (msg: string, meta?: Record<string, unknown>) => write('debug', msg, meta),
  info: (msg: string, meta?: Record<string, unknown>) => write('info', msg, meta),
  warn: (msg: string, meta?: Record<string, unknown>) => write('warn', msg, meta),
  error: (msg: string, meta?: Record<string, unknown>) => write('error', msg, meta),
  /** Never logs bodies or tokens — only identifiers. */
  event: (name: string, meta?: Record<string, unknown>) => {
    if (isTest) return;
    write('info', name, meta);
  },
};
