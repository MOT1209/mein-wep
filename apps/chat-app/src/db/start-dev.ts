import { devEmbeddedOptions, embeddedUrl, startEmbeddedPostgres } from './embedded.js';

const database = process.env.POSTGRES_DB ?? 'chatapp';
const options = devEmbeddedOptions();

const running = await startEmbeddedPostgres(options, database);
const url = embeddedUrl(options, database);

console.log('');
console.log('  PostgreSQL is running (embedded, no Docker required).');
console.log(`  DATABASE_URL=${url}`);
console.log('');
console.log('  Next: copy .env.example to .env and paste the line above.');
console.log('  Stop with Ctrl+C — the data directory is kept for next time.');
console.log('');

let stopping = false;
async function shutdown(signal: string): Promise<void> {
  if (stopping) return;
  stopping = true;
  console.log(`\nStopping PostgreSQL (${signal})...`);
  await running.stop();
  process.exit(0);
}

process.on('SIGINT', () => void shutdown('SIGINT'));
process.on('SIGTERM', () => void shutdown('SIGTERM'));

await new Promise<never>(() => undefined);
