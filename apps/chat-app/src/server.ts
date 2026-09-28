import http from 'node:http';
import { createApp } from './app.js';
import { pool } from './config/db.js';
import { env, isProd } from './config/env.js';
import { runMigrations } from './db/migrate.js';
import { logger } from './lib/logger.js';
import { attachRealtimeServer } from './realtime/gateway.js';

async function main(): Promise<void> {
  if (!isProd) {
    const applied = await runMigrations();
    if (applied.length) logger.info('migrations applied', { files: applied });
  }

  const app = createApp();
  const server = http.createServer(app);
  attachRealtimeServer(server);

  server.listen(env.PORT, () => {
    logger.info('chat backend listening', {
      port: env.PORT,
      env: env.NODE_ENV,
      ws: `ws://localhost:${env.PORT}/ws`,
    });
  });

  const shutdown = async (signal: string) => {
    logger.info('shutting down', { signal });
    server.close(async () => {
      await pool.end().catch(() => undefined);
      process.exit(0);
    });
    setTimeout(() => process.exit(1), 10_000).unref();
  };

  process.on('SIGINT', () => void shutdown('SIGINT'));
  process.on('SIGTERM', () => void shutdown('SIGTERM'));
}

main().catch((err) => {
  logger.error('failed to start', { message: (err as Error).message });
  process.exit(1);
});
