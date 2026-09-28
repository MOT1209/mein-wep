import { rmSync } from 'node:fs';
import pg from 'pg';
import {
  canConnect,
  embeddedUrl,
  startEmbeddedPostgres,
  stopStrayPostmaster,
  testEmbeddedOptions,
  type EmbeddedOptions,
  type RunningEmbedded,
} from '../src/db/embedded.js';

let embedded: RunningEmbedded | undefined;

/** Best-effort wipe of a stale cluster directory left behind by a previous run. */
async function removeClusterDir(options: EmbeddedOptions): Promise<void> {
  for (let attempt = 0; ; attempt += 1) {
    try {
      rmSync(options.databaseDir, { recursive: true, force: true });
      return;
    } catch (error) {
      if (attempt >= 10) throw error;
      await new Promise((r) => setTimeout(r, 300));
    }
  }
}

async function ensureDatabase(databaseUrl: string): Promise<void> {
  const target = new URL(databaseUrl);
  const dbName = target.pathname.replace(/^\//, '');
  if (!dbName) throw new Error('DATABASE_URL must point at a named database.');

  const admin = new URL(databaseUrl);
  admin.pathname = '/postgres';

  const client = new pg.Client({ connectionString: admin.toString() });
  await client.connect();
  try {
    const existing = await client.query('select 1 from pg_database where datname = $1', [dbName]);
    if (existing.rowCount === 0) {
      await client.query(`create database "${dbName.replace(/"/g, '""')}"`);
    }
  } finally {
    await client.end();
  }
}

async function serverEncoding(connectionString: string): Promise<string> {
  const client = new pg.Client({ connectionString });
  await client.connect();
  try {
    const res = await client.query('show server_encoding');
    return String(res.rows[0]?.server_encoding ?? '');
  } finally {
    await client.end();
  }
}

/**
 * Runs before the whole suite:
 *  1. boots an isolated embedded PostgreSQL when `TEST_DATABASE_URL` is absent
 *  2. creates the test database when it is missing
 *  3. applies migrations
 * Test files truncate the tables they touch in their own beforeAll.
 */
export async function setup(): Promise<void> {
  let databaseUrl = process.env.TEST_DATABASE_URL;

  if (databaseUrl) {
    if (!(await canConnect(databaseUrl))) {
      throw new Error(`TEST_DATABASE_URL is not reachable: ${databaseUrl}`);
    }
  } else {
    const options = testEmbeddedOptions();
    if (await canConnect(embeddedUrl(options, 'postgres'))) {
      embedded = { options, url: embeddedUrl(options, 'postgres'), stop: async () => undefined };
    } else {
      // Nothing is answering, so anything on disk is either stale or an orphan
      // postmaster from a crashed run. Clear both before (re)creating the cluster.
      await stopStrayPostmaster(options);
      await removeClusterDir(options);
      embedded = await startEmbeddedPostgres(options);
    }
    databaseUrl = embeddedUrl(options, 'chatapp_test');
  }

  try {
    process.env.DATABASE_URL = databaseUrl;
    await ensureDatabase(databaseUrl);

    if ((await serverEncoding(databaseUrl)) !== 'UTF8') {
      throw new Error(
        `The test cluster is not UTF-8. Delete the data directory and re-run. (${databaseUrl})`,
      );
    }

    const { runMigrations } = await import('../src/db/migrate.js');
    const { pool } = await import('../src/config/db.js');
    await runMigrations();
    await pool.end();
  } catch (error) {
    // Never leave a spawned PostgreSQL behind — vitest would hang waiting for it.
    if (embedded) {
      await embedded.stop().catch(() => undefined);
      embedded = undefined;
    }
    throw error;
  }
}

export async function teardown(): Promise<void> {
  if (embedded) {
    await embedded.stop();
    embedded = undefined;
  }
}
