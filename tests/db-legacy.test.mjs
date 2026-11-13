// Replays the hand-run legacy SQL (db/*.sql, in the order documented in
// SUPABASE_MIGRATIONS.md) on PGlite, the way a Supabase project would have
// run it, then applies supabase/migrations and checks the legacy tables with
// three callers: anon, a signed-in non-admin (anyone can sign up for the farm
// game) and the admin.
//
// The first test proves the hole exists in the legacy files alone, so the
// later tests fail if the hardening migration stops covering it.
import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { PGlite } from '@electric-sql/pglite';
import { pgcrypto } from '@electric-sql/pglite/contrib/pgcrypto';

const read = (p) => fs.readFileSync(new URL(`../${p}`, import.meta.url), 'utf8');
const LEGACY = ['SUPABASE_SETUP', 'SUPABASE_VAULT_UPDATE', 'SUPABASE_CONTACT_FIX', 'SUPABASE_APP_UPDATES',
  'SUPABASE_SETUP_FIXED', 'SUPABASE_SECURITY_FIX', 'SUPABASE_PHASE1_FIX'];
const MIGRATIONS = fs.readdirSync(new URL('../supabase/migrations/', import.meta.url)).sort();
const CONTENT = ['projects', 'models', 'vault_items', 'lessons', 'bot_knowledge', 'prompts', 'codes', 'images', 'media', 'app_updates'];

const ADMIN = '00000000-0000-4000-8000-0000000000a1';
const USER = '00000000-0000-4000-8000-0000000000b2';
let db;

async function as(role, sub, sql) {
  await db.exec(`begin; set local role ${role}; select set_config('request.jwt.claim.sub', '${sub ?? ''}', true);`);
  try {
    const r = await db.query(sql);
    await db.exec('commit');
    return r;
  } catch (err) {
    await db.exec('rollback');
    throw err;
  }
}
const anon = (sql) => as('anon', null, sql);
const user = (sql) => as('authenticated', USER, sql);
const admin = (sql) => as('authenticated', ADMIN, sql);

// A minimal row each table accepts.
const INSERT = {
  projects: "insert into public.projects (title) values ('t') returning id",
  models: "insert into public.models (title) values ('t') returning id",
  vault_items: "insert into public.vault_items (title) values ('t') returning id",
  lessons: "insert into public.lessons (title) values ('t') returning id",
  bot_knowledge: "insert into public.bot_knowledge (keywords) values ('{t}') returning id",
  prompts: "insert into public.prompts (title, content) values ('t', 'c') returning id",
  codes: "insert into public.codes (title, code) values ('t', 'c') returning id",
  images: "insert into public.images (url) values ('/t.png') returning id",
  media: "insert into public.media (title) values ('t') returning id",
  app_updates: "insert into public.app_updates (app_id, name, version, url) values ('x.test', 'T', '1.0.0', '/x.apk') returning app_id",
};

/** Number of rows a write touched, or 0 when it is refused outright. */
async function written(run, sql) {
  try {
    return (await run(sql)).rows.length;
  } catch {
    return 0;
  }
}

before(async () => {
  db = new PGlite({ extensions: { pgcrypto } });
  await db.exec(read('tests/db/supabase-stubs.sql'));
  // What a Supabase project has that the shared stubs leave out.
  await db.exec(`create publication supabase_realtime;
    alter default privileges in schema public grant all on tables to anon, authenticated;
    alter default privileges in schema public grant all on sequences to anon, authenticated;
    alter default privileges in schema public grant execute on functions to anon, authenticated;`);
  await db.exec(`insert into auth.users values ('${ADMIN}', 'owner@example.com'), ('${USER}', 'player@example.com');`);
  for (const f of LEGACY) await db.exec(read(`db/${f}.sql`));
  await db.exec(`insert into public.admin_users (user_id, email) values ('${ADMIN}', 'owner@example.com');`);
});
after(async () => { await db?.close(); });

test('legacy files alone: a signed-in non-admin can write public.models (the reported hole)', async () => {
  assert.equal(await written(user, INSERT.models), 1);
  assert.ok(await written(user, "update public.models set title = 'pwned' returning id") > 0);
});

test('migrations apply on top of the legacy schema, twice', async () => {
  for (const f of MIGRATIONS) await db.exec(read(`supabase/migrations/${f}`));
  for (const f of MIGRATIONS) await db.exec(read(`supabase/migrations/${f}`));
});

test('after the migrations: anon and non-admin users cannot write any legacy content table', async () => {
  for (const run of [anon, user]) {
    for (const t of CONTENT) {
      assert.equal(await written(run, INSERT[t]), 0, `${t} insert`);
      const key = t === 'app_updates' ? 'app_id' : 'id';
      assert.equal(await written(run, `update public.${t} set ${key} = ${key} returning ${key}`), 0, `${t} update`);
      assert.equal(await written(run, `delete from public.${t} returning ${key}`), 0, `${t} delete`);
    }
  }
});

test('after the migrations: the admin can still insert, update and delete', async () => {
  for (const t of CONTENT) {
    assert.equal(await written(admin, INSERT[t]), 1, `${t} insert`);
    const key = t === 'app_updates' ? 'app_id' : 'id';
    assert.ok(await written(admin, `update public.${t} set ${key} = ${key} returning ${key}`) >= 1, `${t} update`);
  }
  assert.equal(await written(admin, "delete from public.models where title = 't' returning id"), 1);
});

test('public rows stay readable; private rows only for the admin', async () => {
  await admin("insert into public.models (title, status) values ('secret-model', 'Private'), ('open-model', 'Public')");
  await admin("insert into public.projects (title, status) values ('secret-project', 'Private')");
  for (const run of [anon, user]) {
    const models = (await run('select title from public.models')).rows.map((r) => r.title);
    assert.ok(models.includes('open-model'));
    assert.ok(!models.includes('secret-model'), 'private model hidden');
    const projects = (await run('select title from public.projects')).rows.map((r) => r.title);
    assert.ok(!projects.includes('secret-project'), 'private project hidden');
    assert.ok((await run('select 1 from public.app_updates')).rows.length > 0, 'app_updates readable');
  }
  const all = (await admin('select title from public.models')).rows.map((r) => r.title);
  assert.ok(all.includes('secret-model'));
});

test('no permissive write policy with a constant true condition is left on content tables', async () => {
  const { rows } = await db.query(`select tablename, policyname, cmd from pg_policies
    where schemaname = 'public' and tablename = any($1) and cmd in ('INSERT','UPDATE','DELETE','ALL')
      and coalesce(btrim(qual), 'true') = 'true' and coalesce(btrim(with_check), 'true') = 'true'`, [CONTENT]);
  assert.deepEqual(rows, []);
});

test('the public contact form can still insert, but nobody but the admin reads messages', async () => {
  await anon("insert into public.contact_messages (name, email, message) values ('A', 'a@b.co', 'hello there')");
  assert.equal((await user('select * from public.contact_messages')).rows.length, 0);
  assert.ok((await admin('select * from public.contact_messages')).rows.length >= 1);
});

test('admin_users cannot be written by a signed-in user (no self-promotion)', async () => {
  assert.equal(await written(user, `insert into public.admin_users (user_id) values ('${USER}') returning user_id`), 0);
  assert.equal((await user('select public.is_admin() a')).rows[0].a, false);
});
