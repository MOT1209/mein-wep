import { defineConfig } from 'vitest/config';

// Must be set before src/config/env.ts is imported anywhere.
// DATABASE_URL is intentionally NOT defaulted here: tests/globalSetup.ts owns it,
// either from TEST_DATABASE_URL or from the embedded PostgreSQL it boots.
process.env.NODE_ENV ??= 'test';
process.env.JWT_SECRET ??= 'test-secret-at-least-32-characters-long-xyz';
process.env.LOG_LEVEL ??= 'silent';
process.env.CORS_ORIGINS ??= 'http://localhost:5173';

export default defineConfig({
  test: {
    environment: 'node',
    include: ['tests/**/*.test.ts'],
    globalSetup: ['tests/globalSetup.ts'],
    fileParallelism: false,
    testTimeout: 20_000,
    hookTimeout: 60_000,
    env: {
      NODE_ENV: 'test',
      LOG_LEVEL: 'silent',
    },
  },
});
