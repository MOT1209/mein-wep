import { existsSync, readFileSync, rmSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import EmbeddedPostgres from 'embedded-postgres';

/**
 * Dev/test PostgreSQL provisioner.
 *
 * The project ships its own Postgres binaries (via `embedded-postgres`) so the
 * backend can be developed and tested on machines without Docker or a system
 * Postgres install. Production still points `DATABASE_URL` at a real server
 * (Supabase/Neon/Docker) — nothing here is imported by `server.ts`.
 */

const projectRoot = fileURLToPath(new URL('../../', import.meta.url));

export interface EmbeddedOptions {
  databaseDir: string;
  port: number;
  user: string;
  password: string;
  persistent: boolean;
}

export function devEmbeddedOptions(): EmbeddedOptions {
  return {
    databaseDir: path.join(projectRoot, '.pgdata'),
    port: Number(process.env.EMBEDDED_PG_PORT ?? 5433),
    user: process.env.EMBEDDED_PG_USER ?? 'chat',
    password: process.env.EMBEDDED_PG_PASSWORD ?? 'chat',
    persistent: true,
  };
}

export function testEmbeddedOptions(): EmbeddedOptions {
  return {
    databaseDir: path.join(projectRoot, '.pgdata-test'),
    port: Number(process.env.TEST_PG_PORT ?? 5434),
    user: 'chat',
    password: 'chat',
    // Deletion of the data directory is owned by the test runner (it happens
    // before the server starts), because `embedded-postgres` deletes it while
    // the postmaster is still shutting down and Windows reports EBUSY.
    persistent: true,
  };
}

export function embeddedUrl(options: EmbeddedOptions, database: string): string {
  return `postgres://${options.user}:${options.password}@127.0.0.1:${options.port}/${database}`;
}

export interface RunningEmbedded {
  options: EmbeddedOptions;
  url: string;
  stop: () => Promise<void>;
}

export async function startEmbeddedPostgres(
  options: EmbeddedOptions,
  database?: string,
): Promise<RunningEmbedded> {
  const quiet = process.env.EMBEDDED_PG_VERBOSE !== '1';
  const pg = new EmbeddedPostgres({
    databaseDir: options.databaseDir,
    port: options.port,
    user: options.user,
    password: options.password,
    persistent: options.persistent,
    // The cluster must be UTF-8 regardless of the host locale, otherwise the
    // migration's UTF-8 box-drawing characters break on Windows (WIN1256/CP1252).
    initdbFlags: ['--encoding=UTF8', '--locale=C', '--no-instructions'],
    onLog: quiet ? () => undefined : (message: string) => console.log(message),
    onError: (message: unknown) => console.error(message),
  });

  const versionFile = path.join(options.databaseDir, 'PG_VERSION');
  if (!existsSync(versionFile) && existsSync(options.databaseDir)) {
    rmSync(options.databaseDir, { recursive: true, force: true });
  }
  if (!existsSync(versionFile)) {
    await pg.initialise();
  }

  await pg.start();
  if (database && database !== 'postgres') {
    await pg.createDatabase(database);
  }

  return {
    options,
    url: embeddedUrl(options, database ?? 'postgres'),
    stop: async () => {
      await pg.stop();
    },
  };
}

export async function canConnect(connectionString: string, timeoutMs = 3000): Promise<boolean> {
  const { default: pg } = await import('pg');
  const client = new pg.Client({ connectionString, connectionTimeoutMillis: timeoutMs });
  try {
    await client.connect();
    await client.query('select 1');
    return true;
  } catch {
    return false;
  } finally {
    await client.end().catch(() => undefined);
  }
}

function isAlive(pid: number): boolean {
  try {
    process.kill(pid, 0);
    return true;
  } catch {
    return false;
  }
}

/**
 * Kills a postmaster left behind by a previous run that crashed before it could
 * shut down. Otherwise `initdb` refuses to start with
 * "pre-existing shared memory block is still in use".
 */
export async function stopStrayPostmaster(options: EmbeddedOptions): Promise<void> {
  const pidFile = path.join(options.databaseDir, 'postmaster.pid');
  if (!existsSync(pidFile)) return;

  const pid = Number(readFileSync(pidFile, 'utf8').split(/\r?\n/)[0]?.trim());
  if (!Number.isInteger(pid) || pid <= 1 || !isAlive(pid)) return;

  try {
    process.kill(pid, 'SIGTERM');
  } catch {
    return;
  }

  for (let attempt = 0; attempt < 50 && isAlive(pid); attempt += 1) {
    await new Promise((r) => setTimeout(r, 100));
  }
  if (isAlive(pid)) {
    try {
      process.kill(pid, 'SIGKILL');
    } catch {
      /* already gone */
    }
  }
}
