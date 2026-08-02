#!/usr/bin/env node
/**
 * Quran Pro — Supabase integration smoke test
 *
 * Required environment variables:
 *   SUPABASE_TEST_EMAIL
 *   SUPABASE_TEST_PASSWORD
 *
 * Optional:
 *   SUPABASE_URL
 *   SUPABASE_ANON_KEY
 *   KEEP_TEST_ROW=1   Keep the test row instead of deleting it after the read.
 *
 * The URL and public anon key are read from js/supabase-config.js when the
 * optional variables are not provided. Never use a service-role key here.
 */

import { readFile } from 'node:fs/promises';
import process from 'node:process';

const PROJECT_ROOT = new URL('../', import.meta.url);
const CONFIG_PATH = new URL('js/supabase-config.js', PROJECT_ROOT);
const TABLE = 'quran_pro_user_data';

function fail(message) {
  throw new Error(message);
}

function requiredEnv(name) {
  const value = process.env[name]?.trim();
  if (!value) fail(`Missing required environment variable: ${name}`);
  return value;
}

async function loadConfig() {
  const source = await readFile(CONFIG_PATH, 'utf8');
  const url = process.env.SUPABASE_URL?.trim() ||
    source.match(/SUPABASE_URL\s*=\s*['"]([^'"]+)/)?.[1];
  const anonKey = process.env.SUPABASE_ANON_KEY?.trim() ||
    source.match(/SUPABASE_KEY\s*=\s*['"]([^'"]+)/)?.[1];

  if (!url || !anonKey) fail('Supabase URL or anon key is not configured.');
  return { url: url.replace(/\/$/, ''), anonKey };
}

function authHeaders(anonKey, accessToken = anonKey) {
  return {
    apikey: anonKey,
    Authorization: `Bearer ${accessToken}`,
    'Content-Type': 'application/json'
  };
}

async function requestJson(url, options = {}) {
  const response = await fetch(url, options);
  const text = await response.text();
  let body = null;
  try {
    body = text ? JSON.parse(text) : null;
  } catch {
    body = null;
  }
  return { response, body };
}

function apiError(label, result) {
  const code = result.body?.error_code || result.body?.code || 'unknown';
  const message = result.body?.msg || result.body?.message || result.body?.error || 'no details';
  return `${label} failed (HTTP ${result.response.status}, ${code}): ${message}`;
}

async function signUpOrLogin(config, email, password) {
  const signup = await requestJson(`${config.url}/auth/v1/signup`, {
    method: 'POST',
    headers: authHeaders(config.anonKey),
    body: JSON.stringify({ email, password })
  });

  const signupSession = signup.body?.access_token;
  if (signup.response.ok && signupSession) {
    console.log('PASS signUp: test user created and authenticated');
  } else {
    if (!signup.response.ok) {
      console.log(`INFO signUp: account may already exist (HTTP ${signup.response.status})`);
    } else {
      console.log('INFO signUp: email confirmation may be required; trying login');
    }
  }

  const login = await requestJson(`${config.url}/auth/v1/token?grant_type=password`, {
    method: 'POST',
    headers: authHeaders(config.anonKey),
    body: JSON.stringify({ email, password })
  });

  if (!login.response.ok || !login.body?.access_token || !login.body?.user?.id) {
    if (signup.response.ok) {
      fail('Login failed after signUp. The test account may now be waiting for email confirmation; confirm it or remove it manually in Supabase Auth, then run the command again.');
    }
    fail(apiError('login', login));
  }

  console.log('PASS login: authenticated test user');
  return {
    accessToken: login.body.access_token,
    userId: login.body.user.id
  };
}

function tableUrl(config, query = '') {
  return `${config.url}/rest/v1/${TABLE}${query}`;
}

async function run() {
  const email = requiredEnv('SUPABASE_TEST_EMAIL');
  const password = requiredEnv('SUPABASE_TEST_PASSWORD');
  if (password.length < 6) fail('SUPABASE_TEST_PASSWORD must contain at least 6 characters.');

  const config = await loadConfig();

  const anonymousRead = await requestJson(tableUrl(config, '?select=user_id&limit=1'), {
    headers: authHeaders(config.anonKey)
  });
  if (!anonymousRead.response.ok) fail(apiError('anonymous RLS read', anonymousRead));
  if (Array.isArray(anonymousRead.body) && anonymousRead.body.length > 0) {
    fail('anonymous RLS read returned data; review RLS before continuing.');
  }
  console.log('PASS RLS anonymous read: no rows exposed before login');

  const session = await signUpOrLogin(config, email, password);
  const userHeaders = authHeaders(config.anonKey, session.accessToken);
  const userFilter = `?select=user_id,settings,last_position&user_id=eq.${encodeURIComponent(session.userId)}`;
  let inserted = false;
  const marker = `quran-pro-integration-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  const updatedMarker = `${marker}-updated`;

  try {
    const before = await requestJson(tableUrl(config, userFilter), {
      headers: userHeaders
    });
    if (!before.response.ok) fail(apiError('preflight read', before));
    if (Array.isArray(before.body) && before.body.length > 0) {
      fail('The test user already has a quran_pro_user_data row. Aborting to avoid overwriting user data. Use a fresh test account.');
    }
    console.log('PASS RLS preflight: authenticated user has no existing test row');

    const payload = {
      user_id: session.userId,
      bookmarks: [{
        type: 'verse',
        surah: 1,
        verse: 1,
        text: 'integration-test',
        marker
      }],
      reading_progress: {
        '1': { lastRead: 1, percentage: 1, marker }
      },
      settings: { integration_test_marker: marker },
      last_position: { surahNumber: 1, verseIndex: 0, marker },
      last_sync: new Date().toISOString()
    };

    const upsert = await requestJson(tableUrl(config, '?on_conflict=user_id'), {
      method: 'POST',
      headers: {
        ...userHeaders,
        Prefer: 'resolution=merge-duplicates,return=representation'
      },
      body: JSON.stringify(payload)
    });
    if (!upsert.response.ok) fail(apiError('upsert', upsert));
    inserted = true;
    console.log('PASS upsert: authenticated user wrote its own row');

    const anonymousAfterWrite = await requestJson(tableUrl(config, `?select=user_id,settings&user_id=eq.${encodeURIComponent(session.userId)}`), {
      headers: authHeaders(config.anonKey)
    });
    if (anonymousAfterWrite.response.ok) {
      if (Array.isArray(anonymousAfterWrite.body) && anonymousAfterWrite.body.length > 0) {
        fail('anonymous RLS read returned the authenticated test row; review RLS immediately.');
      }
      console.log('PASS RLS anonymous read after write: test row is not exposed');
    } else if ([401, 403].includes(anonymousAfterWrite.response.status)) {
      console.log(`PASS RLS anonymous read after write: request denied (HTTP ${anonymousAfterWrite.response.status})`);
    } else {
      fail(apiError('anonymous RLS read after write', anonymousAfterWrite));
    }

    const updatePayload = {
      ...payload,
      bookmarks: [{ ...payload.bookmarks[0], marker: updatedMarker }],
      reading_progress: { '1': { lastRead: 2, percentage: 2, marker: updatedMarker } },
      settings: { integration_test_marker: updatedMarker },
      last_position: { surahNumber: 1, verseIndex: 1, marker: updatedMarker },
      last_sync: new Date().toISOString()
    };
    const update = await requestJson(tableUrl(config, '?on_conflict=user_id'), {
      method: 'POST',
      headers: {
        ...userHeaders,
        Prefer: 'resolution=merge-duplicates,return=representation'
      },
      body: JSON.stringify(updatePayload)
    });
    if (!update.response.ok) fail(apiError('upsert update', update));
    console.log('PASS upsert update: authenticated user updated its own row');

    const readBack = await requestJson(tableUrl(config, userFilter), {
      headers: userHeaders
    });
    if (!readBack.response.ok) fail(apiError('read', readBack));
    const returned = readBack.body?.[0];
    if (!returned || returned.user_id !== session.userId ||
        returned.settings?.integration_test_marker !== updatedMarker ||
        returned.last_position?.marker !== updatedMarker) {
      fail('read verification failed: the returned row did not match the updated marker.');
    }
    console.log('PASS read: returned row belongs to the test user and contains the updated marker');
  } finally {
    if (inserted && process.env.KEEP_TEST_ROW !== '1') {
      const cleanup = await requestJson(tableUrl(config, `?user_id=eq.${encodeURIComponent(session.userId)}`), {
        method: 'DELETE',
        headers: userHeaders
      });
      if (!cleanup.response.ok) {
        console.error(`WARN cleanup: could not delete the test row (HTTP ${cleanup.response.status})`);
        process.exitCode = 1;
      } else {
        console.log('PASS cleanup: test row deleted through the user RLS policy');
      }
    } else if (inserted) {
      console.log('INFO cleanup: skipped because KEEP_TEST_ROW=1');
    }
  }
}

run().catch(error => {
  console.error(`FAIL ${error.message}`);
  process.exitCode = 1;
});
