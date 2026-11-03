// Applies supabase/migrations + supabase/seed to an in-process Postgres
// (PGlite) with stub Supabase schemas, then checks Row Level Security the way
// the real API would hit it: as anon, as a signed-in non-admin, as the admin.
import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { PGlite } from '@electric-sql/pglite';
import { pgcrypto } from '@electric-sql/pglite/contrib/pgcrypto';

const read = (p) => fs.readFileSync(new URL(`../${p}`, import.meta.url), 'utf8');
const MIGRATIONS = fs.readdirSync(new URL('../supabase/migrations/', import.meta.url)).sort();
const SEEDS = fs.readdirSync(new URL('../supabase/seed/', import.meta.url)).sort();

const ADMIN = '00000000-0000-4000-8000-000000000001';
const USER = '00000000-0000-4000-8000-000000000002';
const SECRET = 'x'.repeat(40);
let db;

/** Runs SQL as a role, the way PostgREST does (role + JWT sub). */
async function as(role, sub, sql, params = []) {
  await db.exec(`begin; set local role ${role}; select set_config('request.jwt.claim.sub', '${sub ?? ''}', true);`);
  try {
    const r = await db.query(sql, params);
    await db.exec('commit');
    return r.rows;
  } catch (err) {
    await db.exec('rollback');
    throw err;
  }
}
const anon = (sql, p) => as('anon', null, sql, p);
const user = (sql, p) => as('authenticated', USER, sql, p);
const admin = (sql, p) => as('authenticated', ADMIN, sql, p);

before(async () => {
  db = new PGlite({ extensions: { pgcrypto } });
  await db.exec(read('tests/db/supabase-stubs.sql'));
  await db.exec(`insert into auth.users values ('${ADMIN}', 'owner@example.com'), ('${USER}', 'someone@example.com');`);
  for (const f of MIGRATIONS) await db.exec(read(`supabase/migrations/${f}`));
  await db.exec(`insert into public.admin_users (user_id, email) values ('${ADMIN}', 'owner@example.com');`);
  for (const f of SEEDS) await db.exec(read(`supabase/seed/${f}`));
});
after(async () => { await db?.close(); });

test('migrations and seed apply, and re-applying them changes nothing', async () => {
  const before = await db.query('select count(*)::int n from public.studio_projects');
  for (const f of MIGRATIONS) await db.exec(read(`supabase/migrations/${f}`));
  for (const f of SEEDS) await db.exec(read(`supabase/seed/${f}`));
  const afterRun = await db.query('select count(*)::int n from public.studio_projects');
  assert.equal(afterRun.rows[0].n, before.rows[0].n);
  assert.equal(before.rows[0].n, JSON.parse(read('_data/studioCatalog.json')).projects.length);
});

test('seed mirrors the catalogue: hidden records stay hidden', async () => {
  const catalog = JSON.parse(read('_data/studioCatalog.json')).projects;
  const rows = await db.query('select slug, visibility from public.studio_projects');
  for (const p of catalog) {
    const row = rows.rows.find((r) => r.slug === p.id);
    assert.equal(row.visibility, p.hidden ? 'hidden' : 'public', p.id);
  }
});

test('anon sees only public, non-deleted projects', async () => {
  const pub = await anon('select slug from public.studio_projects');
  const expected = JSON.parse(read('_data/studioCatalog.json')).projects.filter((p) => !p.hidden).map((p) => p.id);
  assert.deepEqual(pub.map((r) => r.slug).sort(), expected.sort());
  await admin("update public.studio_projects set deleted_at = now() where slug = $1", [expected[0]]);
  assert.ok(!(await anon('select slug from public.studio_projects')).some((r) => r.slug === expected[0]));
  await admin("update public.studio_projects set deleted_at = null where slug = $1", [expected[0]]);
});

test('anon and non-admin users cannot write anything', async () => {
  for (const run of [anon, user]) {
    await assert.rejects(run("insert into public.project_categories (slug, name) values ('x', 'X')"));
    // Either the role has no privilege at all (error) or RLS leaves no rows.
    for (const sql of ["update public.studio_projects set title = 'pwned' returning id",
                       'delete from public.studio_projects returning id',
                       "update public.website_settings set value = '{}' returning key"]) {
      const rows = await run(sql).catch(() => []);
      assert.equal(rows.length, 0, sql);
    }
    await assert.rejects(run("insert into public.activity_logs (action, entity) values ('x', 'y')"));
  }
});

test('non-admins cannot read hidden projects, logs, private settings or other admins', async () => {
  await admin("insert into public.website_settings (key, value, is_public) values ('private.note', '{\"v\":1}', false)");
  for (const run of [anon, user]) {
    assert.ok(!(await run("select slug from public.studio_projects where visibility = 'hidden'")).length);
    assert.ok(!(await run("select key from public.website_settings where key = 'private.note'")).length);
    assert.ok(!(await run('select id from public.github_repositories')).length);
  }
  await assert.rejects(anon('select * from public.activity_logs'));
  assert.equal((await user('select * from public.activity_logs')).length, 0);
  assert.equal((await user('select * from public.admin_users')).length, 0);
});

test('admin can create, hide, soft-delete and restore a project', async () => {
  const [row] = await admin(`insert into public.studio_projects (slug, section, title, visibility)
    values ('test-project', 'labs', 'Test', 'public') returning id`);
  assert.ok((await anon("select 1 from public.studio_projects where slug = 'test-project'")).length);
  await admin("update public.studio_projects set visibility = 'hidden' where id = $1", [row.id]);
  assert.ok(!(await anon("select 1 from public.studio_projects where slug = 'test-project'")).length);
  await admin("update public.studio_projects set visibility = 'public', deleted_at = now() where id = $1", [row.id]);
  assert.ok(!(await anon("select 1 from public.studio_projects where slug = 'test-project'")).length);
  await admin('update public.studio_projects set deleted_at = null where id = $1', [row.id]);
  assert.ok((await anon("select 1 from public.studio_projects where slug = 'test-project'")).length);
  await admin('delete from public.studio_projects where id = $1', [row.id]);
});

test('constraints reject unsafe links, missing alt text and bad slugs', async () => {
  const bad = [
    "insert into public.studio_projects (slug, section, title, launch_url) values ('a1', 'apps', 'A', 'javascript:alert(1)')",
    "insert into public.studio_projects (slug, section, title, demo_url) values ('a2', 'apps', 'A', '//evil.example/x')",
    "insert into public.studio_projects (slug, section, title, cover_image) values ('a3', 'apps', 'A', 'https://x.example/a.png')",
    "insert into public.studio_projects (slug, section, title) values ('Bad Slug', 'apps', 'A')",
    "insert into public.studio_projects (slug, section, title) values ('a4', 'secret', 'A')",
    "insert into public.studio_projects (slug, section, title, status, launch_url) values ('a5', 'apps', 'A', 'Coming Soon', 'apps/x/')",
    "insert into public.navigation_items (nav_key, label, href) values ('evil', 'E', 'data:text/html,1')",
    "insert into public.blog_posts (slug, title, status) values ('p1', 'P', 'published')",
  ];
  for (const sql of bad) await assert.rejects(admin(sql), undefined, sql);
  await admin(`insert into public.studio_projects (slug, section, title, demo_url, launch_url, cover_image, image_alt)
    values ('good-links', 'apps', 'G', 'https://king.example/demo?x=1', 'apps/quiz-app/', '/images/a.png', 'Alt')`);
  await admin("delete from public.studio_projects where slug = 'good-links'");
});

test('blog: drafts and future posts are not public, published ones are', async () => {
  await admin(`insert into public.blog_posts (slug, title, status, published_at) values
    ('draft-post', 'D', 'draft', null),
    ('future-post', 'F', 'published', now() + interval '1 day'),
    ('live-post', 'L', 'published', now() - interval '1 day')`);
  const rows = (await anon('select slug from public.blog_posts')).map((r) => r.slug);
  assert.deepEqual(rows, ['live-post']);
});

test('github_sync_apply: admin or secret only; never overrides review decisions', async () => {
  const repo = (id, extra = {}) => ({ id, full_name: `MOT1209/r${id}`, name: `r${id}`, html_url: `https://github.com/MOT1209/r${id}`, ...extra });
  await assert.rejects(anon("select public.github_sync_apply('[]', true, 'scheduled', null)"));
  await assert.rejects(user("select public.github_sync_apply('[]', true, 'manual', null)"));
  await assert.rejects(admin("select public.admin_set_cron_secret('short')"));
  await assert.rejects(user(`select public.admin_set_cron_secret('${SECRET}')`));
  await admin(`select public.admin_set_cron_secret('${SECRET}')`);
  await assert.rejects(anon(`select public.github_sync_apply('[]', true, 'scheduled', '${'y'.repeat(40)}')`));

  const first = [repo(1, { match_reason: 'name contains KING' }), repo(2), repo(3, { is_private: true })];
  const [r1] = await anon('select public.github_sync_apply($1::jsonb, true, $2, $3) r', [JSON.stringify(first), 'scheduled', SECRET]);
  assert.equal(r1.r.repos_seen, 3);
  assert.equal(r1.r.new_candidates, 1);
  assert.deepEqual((await admin("select id from public.github_repositories where review_state = 'pending'")).map((r) => Number(r.id)), [1]);

  // Owner ignores repo 1 and approves repo 2 by linking it to a project.
  await admin("update public.github_repositories set review_state = 'ignored' where id = 1");
  await admin("update public.github_repositories set review_state = 'approved' where id = 2");
  await admin("insert into public.studio_projects (slug, section, title, github_repo_id, short_description) values ('r2', 'labs', 'My own title', 2, 'Owner text')");

  // Next sync: repo 2 is renamed upstream with a new description, repo 1 still matches,
  // the private repo 3 is absent from a token-less (public only) listing.
  const second = [repo(1, { match_reason: 'name contains KING' }), repo(2, { full_name: 'MOT1209/renamed', description: 'GitHub text' })];
  const [r2] = await admin('select public.github_sync_apply($1::jsonb, true, $2) r', [JSON.stringify(second), 'manual']);
  assert.equal(r2.r.missing, 0, 'private repo is not marked missing by a public-only listing');
  const states = await admin('select id, review_state, full_name, status from public.github_repositories order by id');
  assert.deepEqual(states.map((s) => [Number(s.id), s.review_state, s.status]), [[1, 'ignored', 'ok'], [2, 'approved', 'ok'], [3, 'unmatched', 'ok']]);
  assert.equal(states[1].full_name, 'MOT1209/renamed');
  const [p] = await admin("select title, short_description from public.studio_projects where slug = 'r2'");
  assert.deepEqual(p, { title: 'My own title', short_description: 'Owner text' }, 'owner fields untouched');

  // A public repo that disappears is marked missing, and the project stays.
  const [r3] = await admin('select public.github_sync_apply($1::jsonb, true, $2) r', [JSON.stringify([repo(1)]), 'manual']);
  assert.equal(r3.r.missing, 1);
  assert.equal((await admin('select status from public.github_repositories where id = 2'))[0].status, 'missing');
  assert.equal((await admin("select count(*)::int n from public.studio_projects where slug = 'r2'"))[0].n, 1);
  assert.ok((await admin('select count(*)::int n from public.github_sync_logs'))[0].n >= 3);
  await admin("delete from public.studio_projects where slug = 'r2'");
});

test('linked repository metadata is public only for public projects', async () => {
  await admin("insert into public.github_repositories (id, full_name, name, html_url) values (99, 'MOT1209/x', 'x', 'https://github.com/MOT1209/x')");
  await admin("insert into public.studio_projects (slug, section, title, github_repo_id, visibility) values ('linked', 'labs', 'L', 99, 'hidden')");
  assert.equal((await anon('select id from public.github_repositories where id = 99')).length, 0);
  await admin("update public.studio_projects set visibility = 'public' where slug = 'linked'");
  assert.equal((await anon('select id from public.github_repositories where id = 99')).length, 1);
  await admin("delete from public.studio_projects where slug = 'linked'");
});

test('media bucket: images only, 5 MB, writes for admins only', async () => {
  const [b] = (await db.query("select public, file_size_limit, allowed_mime_types from storage.buckets where id = 'media'")).rows;
  assert.equal(b.public, true);
  assert.equal(Number(b.file_size_limit), 5 * 1024 * 1024);
  assert.ok(!b.allowed_mime_types.includes('image/svg+xml'), 'SVG can carry script');
  await assert.rejects(user("insert into storage.objects (bucket_id, name) values ('media', 'x.png')"));
  await admin("insert into storage.objects (bucket_id, name) values ('media', 'x.png')");
  assert.equal((await user("select name from storage.objects where bucket_id = 'media'")).length, 0);
  assert.equal((await admin("select name from storage.objects where bucket_id = 'media'")).length, 1);
});

test('the private schema is unreachable for API roles', async () => {
  await assert.rejects(anon('select * from private.app_secrets'));
  await assert.rejects(user('select * from private.app_secrets'));
  const [s] = await admin('select public.admin_cron_secret_status() s');
  assert.equal(s.s.configured, true);
  assert.ok(!JSON.stringify(s).includes('hash'));
});
