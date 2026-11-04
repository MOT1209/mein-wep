/**
 * Admin CMS operations, dispatched by api/admin/[resource].js as
 * POST /api/admin/<resource> { action, ...args }.
 *
 * Every handler runs as the signed-in admin (createDb uses their JWT), and
 * every change is written to activity_logs. Deleting a project or a post is a
 * soft delete (restorable from the trash); "purge" removes the row for good
 * and is only possible from the trash. Nothing here can delete or change a
 * GitHub repository: the sync only ever reads from GitHub.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { eq } from './supabase-rest.js';
import { InputError, requireUuid, slugify, types as T, validate } from './cms-validate.js';
import { listOwnerRepos } from './github.js';
import { BUCKET, cleanFolder, cleanObjectPath, prepareUpload, sniffImage } from './media.js';

const PROJECT_SELECT = [
  '*',
  'category:project_categories(id,slug,name)',
  'repo:github_repositories(id,full_name,html_url,language,is_archived,status,description)',
].join(',');

const one = (rows, what = 'Item') => {
  if (!rows?.length) throw Object.assign(new InputError(`${what} not found`), { status: 404 });
  return rows[0];
};
const q = encodeURIComponent;

/** Slug not yet used by any project (deleted ones included). */
async function freeSlug(db, wanted) {
  const base = slugify(wanted);
  const taken = new Set((await db.select('studio_projects', `select=slug&slug=like.${q(`${base}*`)}`)).map((r) => r.slug));
  if (!taken.has(base)) return base;
  for (let i = 2; i < 100; i += 1) if (!taken.has(`${base}-${i}`)) return `${base}-${i}`;
  throw new InputError('Could not find a free slug');
}

// ---------------------------------------------------------------------------
// Overview
// ---------------------------------------------------------------------------
const overview = {
  async get({ db }) {
    const [projects, pending, lastSync, activity, lastPublish, posts] = await Promise.all([
      db.select('studio_projects', 'select=id,title,slug,section,visibility,status,featured,deleted_at,updated_at&order=updated_at.desc'),
      db.select('github_repositories', 'select=id&review_state=eq.pending'),
      db.select('github_sync_logs', 'select=*&order=started_at.desc&limit=1'),
      db.select('activity_logs', 'select=id,actor_email,action,entity,entity_id,details,created_at&order=created_at.desc&limit=10'),
      db.select('activity_logs', 'select=created_at,actor_email&action=eq.publish&order=created_at.desc&limit=1'),
      db.select('blog_posts', 'select=id,status,deleted_at'),
    ]);
    const live = projects.filter((p) => !p.deleted_at);
    return {
      projects: {
        total: live.length,
        published: live.filter((p) => p.visibility === 'public').length,
        hidden: live.filter((p) => p.visibility === 'hidden').length,
        inDevelopment: live.filter((p) => p.status === 'In Development').length,
        featured: live.filter((p) => p.featured).length,
        trash: projects.length - live.length,
      },
      posts: {
        published: posts.filter((p) => !p.deleted_at && p.status === 'published').length,
        drafts: posts.filter((p) => !p.deleted_at && p.status === 'draft').length,
      },
      recentlyChanged: live.slice(0, 5),
      github: { pending: pending.length, lastSync: lastSync[0] ?? null },
      activity,
      lastPublish: lastPublish[0] ?? null,
      config: configFlags(),
    };
  },
};

/** Which server settings exist (names only, never values). */
function configFlags() {
  return {
    deployHook: !!process.env.VERCEL_DEPLOY_HOOK_URL,
    githubToken: !!process.env.GITHUB_TOKEN,
    cronSecret: (process.env.CRON_SECRET || '').length >= 32,
  };
}

// ---------------------------------------------------------------------------
// King Studio projects
// ---------------------------------------------------------------------------
const projects = {
  async list({ db }) {
    return db.select('studio_projects', `select=${PROJECT_SELECT}&order=sort_order.asc,title.asc`);
  },

  async get({ db }, { id }) {
    const pid = requireUuid(id);
    const p = one(await db.select('studio_projects', `select=${PROJECT_SELECT},images:project_images(id,url,alt,sort_order)&id=${eq(pid)}`), 'Project');
    p.images = (p.images ?? []).sort((a, b) => a.sort_order - b.sort_order);
    return p;
  },

  async create({ db, log }, { fields }) {
    const f = validate('studio_projects', fields ?? {}, { required: ['title', 'section'] });
    f.slug = f.slug ? f.slug : await freeSlug(db, f.title);
    f.visibility ??= 'hidden';
    if (f.sort_order === undefined) {
      const last = await db.select('studio_projects', 'select=sort_order&order=sort_order.desc&limit=1');
      f.sort_order = (last[0]?.sort_order ?? 0) + 10;
    }
    const [row] = await db.insert('studio_projects', f);
    await log('create', 'project', row.id, { slug: row.slug, title: row.title });
    return row;
  },

  async update({ db, log }, { id, fields }) {
    const pid = requireUuid(id);
    const f = validate('studio_projects', fields ?? {}, { partial: true });
    const [row] = await db.update('studio_projects', `id=${eq(pid)}`, f);
    if (!row) throw Object.assign(new InputError('Project not found'), { status: 404 });
    await log('update', 'project', pid, { fields: Object.keys(f) });
    return row;
  },

  async set_visibility(ctx, { id, visibility }) {
    const v = T.oneOf('public', 'hidden')(visibility, 'visibility');
    const row = await projects.update({ ...ctx, log: async () => {} }, { id, fields: { visibility: v } });
    await ctx.log(v === 'public' ? 'publish_project' : 'hide_project', 'project', row.id, { slug: row.slug });
    return row;
  },

  async set_featured(ctx, { id, featured }) {
    return projects.update(ctx, { id, fields: { featured: T.bool(featured, 'featured') } });
  },

  async delete({ db, log }, { id }) {
    const pid = requireUuid(id);
    const [row] = await db.update('studio_projects', `id=${eq(pid)}&deleted_at=is.null`, { deleted_at: new Date().toISOString() });
    if (!row) throw Object.assign(new InputError('Project not found or already in the trash'), { status: 404 });
    await log('trash', 'project', pid, { slug: row.slug });
    return row;
  },

  async restore({ db, log }, { id }) {
    const pid = requireUuid(id);
    const [row] = await db.update('studio_projects', `id=${eq(pid)}&deleted_at=not.is.null`, { deleted_at: null });
    if (!row) throw Object.assign(new InputError('Project is not in the trash'), { status: 404 });
    await log('restore', 'project', pid, { slug: row.slug });
    return row;
  },

  /** Permanent removal from the catalogue. The GitHub repository is untouched. */
  async purge({ db, log }, { id }) {
    const pid = requireUuid(id);
    const [row] = await db.remove('studio_projects', `id=${eq(pid)}&deleted_at=not.is.null`);
    if (!row) throw new InputError('Only projects in the trash can be deleted permanently');
    if (row.github_repo_id) {
      // Keep the repository known but stop proposing it again.
      await db.update('github_repositories', `id=${eq(row.github_repo_id)}`, { review_state: 'ignored' });
    }
    await log('purge', 'project', pid, { slug: row.slug, title: row.title });
    return { id: pid };
  },

  async reorder({ db, log }, { ids }) {
    if (!Array.isArray(ids) || !ids.length || ids.length > 500) throw new InputError('ids must be a list');
    const clean = ids.map((x, i) => requireUuid(x, `ids[${i}]`));
    if (new Set(clean).size !== clean.length) throw new InputError('Duplicate id in order');
    for (const [i, pid] of clean.entries()) {
      await db.update('studio_projects', `id=${eq(pid)}`, { sort_order: (i + 1) * 10 });
    }
    await log('reorder', 'project', null, { count: clean.length });
    return { count: clean.length };
  },

  async set_images({ db, log }, { id, images }) {
    const pid = requireUuid(id);
    if (!Array.isArray(images) || images.length > 30) throw new InputError('images must be a list of at most 30');
    const rows = images.map((im, i) => ({
      project_id: pid,
      url: T.url(im?.url, `images[${i}].url`) ?? (() => { throw new InputError(`images[${i}].url is required`); })(),
      alt: T.str(300, { min: 1 })(im?.alt, `images[${i}].alt`),
      sort_order: (i + 1) * 10,
    }));
    one(await db.select('studio_projects', `select=id&id=${eq(pid)}`), 'Project');
    await db.call('DELETE', `/rest/v1/project_images?project_id=${eq(pid)}`);
    const saved = rows.length ? await db.insert('project_images', rows) : [];
    await log('update_gallery', 'project', pid, { images: saved.length });
    return saved;
  },
};

// ---------------------------------------------------------------------------
// Categories
// ---------------------------------------------------------------------------
const categories = {
  async list({ db }) {
    const [cats, used] = await Promise.all([
      db.select('project_categories', 'select=*&order=sort_order.asc,name.asc'),
      db.select('studio_projects', 'select=category_id&deleted_at=is.null'),
    ]);
    const count = used.reduce((m, r) => m.set(r.category_id, (m.get(r.category_id) ?? 0) + 1), new Map());
    return cats.map((c) => ({ ...c, projects: count.get(c.id) ?? 0 }));
  },
  async create({ db, log }, { fields }) {
    const f = validate('project_categories', fields ?? {}, { required: ['name'] });
    f.slug ??= slugify(f.name).slice(0, 60);
    const [row] = await db.insert('project_categories', f);
    await log('create', 'category', row.id, { slug: row.slug });
    return row;
  },
  async update({ db, log }, { id, fields }) {
    const cid = requireUuid(id);
    const f = validate('project_categories', fields ?? {}, { partial: true });
    const [row] = await db.update('project_categories', `id=${eq(cid)}`, f);
    if (!row) throw Object.assign(new InputError('Category not found'), { status: 404 });
    await log('update', 'category', cid, { fields: Object.keys(f) });
    return row;
  },
  /** Projects in a deleted category keep existing, without a category. */
  async delete({ db, log }, { id }) {
    const cid = requireUuid(id);
    const [row] = await db.remove('project_categories', `id=${eq(cid)}`);
    if (!row) throw Object.assign(new InputError('Category not found'), { status: 404 });
    await log('delete', 'category', cid, { slug: row.slug });
    return { id: cid };
  },
};

// ---------------------------------------------------------------------------
// GitHub
// ---------------------------------------------------------------------------
const repoId = (v) => {
  if (!Number.isSafeInteger(v) || v <= 0) throw new InputError('repo_id must be a GitHub repository id');
  return v;
};

const github = {
  async list({ db }) {
    const [repos, linked] = await Promise.all([
      db.select('github_repositories', 'select=*&order=review_state.asc,full_name.asc'),
      db.select('studio_projects', 'select=id,slug,title,visibility,deleted_at,github_repo_id&github_repo_id=not.is.null'),
    ]);
    const byRepo = new Map(linked.map((p) => [p.github_repo_id, p]));
    return repos.map((r) => ({ ...r, project: byRepo.get(r.id) ?? null }));
  },

  async sync({ db, log }) {
    const result = await listOwnerRepos();
    const summary = await db.rpc('github_sync_apply', {
      p_repos: result.repos,
      p_complete: result.complete,
      p_trigger: 'manual',
      p_error: result.error,
    });
    await log('github_sync', 'github', null, { ...summary, error: result.error });
    return { ...summary, error: result.error, tokenUsed: !!process.env.GITHUB_TOKEN };
  },

  async logs({ db }) {
    return db.select('github_sync_logs', 'select=*&order=started_at.desc&limit=20');
  },

  /** Turns a repository into a (hidden) King Studio project for the owner to edit. */
  async approve({ db, log }, { repo_id, section }) {
    const id = repoId(repo_id);
    const sec = section === undefined ? 'labs' : T.oneOf('games', 'apps', 'labs')(section, 'section');
    const repo = one(await db.select('github_repositories', `select=*&id=${eq(id)}`), 'Repository');
    const existing = await db.select('studio_projects', `select=id,slug&github_repo_id=${eq(id)}`);
    if (existing.length) throw Object.assign(new InputError(`Already in King Studio as "${existing[0].slug}"`), { status: 409 });
    const [project] = await db.insert('studio_projects', {
      slug: await freeSlug(db, repo.name),
      section: sec,
      title: repo.name.replace(/[-_]+/g, ' ').trim().slice(0, 120) || repo.name,
      short_description: (repo.description ?? '').slice(0, 400),
      project_type: 'Tool',
      technologies: repo.language ? [repo.language] : [],
      status: repo.is_archived ? 'Experimental' : 'In Development',
      visibility: 'hidden',
      sort_order: 1000,
      github_repo_id: id,
    });
    await db.update('github_repositories', `id=${eq(id)}`, { review_state: 'approved' });
    await log('approve_repo', 'github', String(id), { repo: repo.full_name, project: project.slug });
    return project;
  },

  async ignore({ db, log }, { repo_id }) {
    const id = repoId(repo_id);
    const [row] = await db.update('github_repositories', `id=${eq(id)}`, { review_state: 'ignored' });
    if (!row) throw Object.assign(new InputError('Repository not found'), { status: 404 });
    await log('ignore_repo', 'github', String(id), { repo: row.full_name });
    return row;
  },

  async unignore({ db, log }, { repo_id }) {
    const id = repoId(repo_id);
    const repo = one(await db.select('github_repositories', `select=id,match_reason,full_name&id=${eq(id)}`), 'Repository');
    const [row] = await db.update('github_repositories', `id=${eq(id)}`, { review_state: repo.match_reason ? 'pending' : 'unmatched' });
    await log('unignore_repo', 'github', String(id), { repo: repo.full_name });
    return row;
  },

  /** Link an existing project to a repository (explicit selection). */
  async link({ db, log }, { repo_id, project_id }) {
    const id = repoId(repo_id);
    const pid = requireUuid(project_id, 'project_id');
    const [row] = await db.update('studio_projects', `id=${eq(pid)}`, { github_repo_id: id });
    if (!row) throw Object.assign(new InputError('Project not found'), { status: 404 });
    await db.update('github_repositories', `id=${eq(id)}`, { review_state: 'approved' });
    await log('link_repo', 'project', pid, { repo_id: id });
    return row;
  },

  async unlink({ db, log }, { project_id }) {
    const pid = requireUuid(project_id, 'project_id');
    const [row] = await db.update('studio_projects', `id=${eq(pid)}`, { github_repo_id: null });
    if (!row) throw Object.assign(new InputError('Project not found'), { status: 404 });
    await log('unlink_repo', 'project', pid, {});
    return row;
  },

  async schedule_status({ db }) {
    let stored = { configured: false, updated_at: null };
    try { stored = await db.rpc('admin_cron_secret_status'); } catch { /* migration missing */ }
    return { ...configFlags(), storedSecret: stored };
  },

  /** Stores the hash of CRON_SECRET so the scheduled job may write sync results. */
  async schedule_enable({ db, log }) {
    const secret = process.env.CRON_SECRET || '';
    if (secret.length < 32) throw Object.assign(new InputError('Set CRON_SECRET (32+ random characters) in Vercel first'), { status: 412 });
    await db.rpc('admin_set_cron_secret', { p_secret: secret });
    await log('enable_scheduled_sync', 'github', null, {});
    return { enabled: true };
  },
};

// ---------------------------------------------------------------------------
// Media (Supabase Storage)
// ---------------------------------------------------------------------------
async function mediaReferences(db, url) {
  const [projectsUsing, images, posts, settings] = await Promise.all([
    db.select('studio_projects', `select=slug&cover_image=${eq(url)}`),
    db.select('project_images', `select=project_id&url=${eq(url)}`),
    db.select('blog_posts', `select=slug&cover_image=${eq(url)}`),
    db.select('website_settings', 'select=key,value'),
  ]);
  return [
    ...projectsUsing.map((p) => `project ${p.slug}`),
    ...images.map((i) => `gallery of project ${i.project_id}`),
    ...posts.map((p) => `post ${p.slug}`),
    ...settings.filter((s) => JSON.stringify(s.value).includes(url)).map((s) => `setting ${s.key}`),
  ];
}

const media = {
  async list({ db }, { folder }) {
    const prefix = folder ? cleanFolder(folder) : '';
    const items = await db.storage('POST', `object/list/${BUCKET}`, {
      body: { prefix, limit: 200, offset: 0, sortBy: { column: 'created_at', order: 'desc' } },
    });
    return (items ?? []).map((it) => {
      const isFolder = !it.id;
      const objectPath = prefix ? `${prefix}/${it.name}` : it.name;
      return {
        name: it.name,
        folder: isFolder,
        path: objectPath,
        url: isFolder ? null : db.publicUrl(BUCKET, objectPath),
        size: it.metadata?.size ?? null,
        type: it.metadata?.mimetype ?? null,
        created_at: it.created_at ?? null,
      };
    });
  },

  async upload({ db, log }, { folder, filename, dataBase64, replacePath }) {
    const file = prepareUpload({ folder, filename, dataBase64 });
    let target = file.path;
    let upsert = 'false';
    if (replacePath !== undefined) {
      target = cleanObjectPath(replacePath);
      if (target.split('.').pop() !== file.path.split('.').pop()) {
        throw new InputError('A replacement must be the same image type as the original');
      }
      upsert = 'true';
    }
    await db.storage(replacePath ? 'PUT' : 'POST', `object/${BUCKET}/${target.split('/').map(encodeURIComponent).join('/')}`, {
      body: file.bytes,
      headers: { 'Content-Type': file.type, 'x-upsert': upsert, 'Cache-Control': 'max-age=3600' },
    });
    const url = db.publicUrl(BUCKET, target);
    await log(replacePath ? 'replace_media' : 'upload_media', 'media', target, { type: file.type, bytes: file.bytes.length });
    return { path: target, url, type: file.type, size: file.bytes.length };
  },

  /** Refuses to delete an image that is still used, unless `force` is set. */
  async delete({ db, log }, { path: objectPath, force }) {
    const p = cleanObjectPath(objectPath);
    const url = db.publicUrl(BUCKET, p);
    const refs = await mediaReferences(db, url);
    if (refs.length && force !== true) {
      throw Object.assign(new InputError(`Still used by: ${refs.join(', ')}`), { status: 409, details: refs });
    }
    await db.storage('DELETE', `object/${BUCKET}`, { body: { prefixes: [p] } });
    await log('delete_media', 'media', p, { forced: !!refs.length });
    return { path: p };
  },
};

// ---------------------------------------------------------------------------
// Site content: settings, pages, navigation
// ---------------------------------------------------------------------------
const SETTING_KEY = /^[a-z][a-z0-9_.]{1,60}$/;
// Pages whose texts the templates read (_data/cms.js).
const PAGE_KEYS = ['home', 'studio', 'about', 'contact', 'footer'];

/** Page content: flat object of short texts or lists of texts. */
function pageContent(v) {
  if (!v || typeof v !== 'object' || Array.isArray(v)) throw new InputError('content must be an object');
  const out = {};
  for (const [k, val] of Object.entries(v)) {
    if (!/^[a-zA-Z][a-zA-Z0-9_]{0,40}$/.test(k)) throw new InputError(`Bad field name: ${k}`);
    if (val === null || val === '') continue;
    if (typeof val === 'string') out[k] = T.str(5000)(val, k);
    else if (Array.isArray(val)) out[k] = T.list(40, 300)(val, k);
    else throw new InputError(`${k} must be text or a list of texts`);
  }
  if (JSON.stringify(out).length > 50_000) throw new InputError('Page content too large');
  return out;
}

const content = {
  async settings_list({ db }) {
    return db.select('website_settings', 'select=*&order=key.asc');
  },
  async settings_set({ db, log }, { key, value, is_public }) {
    if (typeof key !== 'string' || !SETTING_KEY.test(key)) throw new InputError('Bad setting key');
    if (value === undefined || JSON.stringify(value).length > 20_000) throw new InputError('Setting value missing or too large');
    const row = { key, value, is_public: is_public === undefined ? true : T.bool(is_public, 'is_public') };
    const [saved] = await db.upsert('website_settings', row, 'key');
    await log('update_setting', 'setting', key, {});
    return saved;
  },
  async settings_delete({ db, log }, { key }) {
    if (typeof key !== 'string' || !SETTING_KEY.test(key)) throw new InputError('Bad setting key');
    await db.remove('website_settings', `key=${eq(key)}`);
    await log('delete_setting', 'setting', key, {});
    return { key };
  },
  async pages_get({ db }, { page_key }) {
    const key = T.oneOf(...PAGE_KEYS)(page_key, 'page_key');
    return db.select('website_pages', `select=*&page_key=${eq(key)}`);
  },
  async pages_set({ db, log }, { page_key, locale, content: body }) {
    const key = T.oneOf(...PAGE_KEYS)(page_key, 'page_key');
    const loc = T.oneOf('en', 'de', 'ar')(locale, 'locale');
    const [saved] = await db.upsert('website_pages', { page_key: key, locale: loc, content: pageContent(body) }, 'page_key,locale');
    await log('update_page', 'page', `${key}/${loc}`, {});
    return saved;
  },
  async nav_list({ db }) {
    return db.select('navigation_items', 'select=*&order=sort_order.asc');
  },
  async nav_create({ db, log }, { fields }) {
    const f = validate('navigation_items', fields ?? {}, { required: ['nav_key', 'label'] });
    if (f.href === undefined) throw new InputError('href is required');
    const [row] = await db.insert('navigation_items', f);
    await log('create', 'nav', row.id, { key: row.nav_key });
    return row;
  },
  async nav_update({ db, log }, { id, fields }) {
    const nid = requireUuid(id);
    const f = validate('navigation_items', fields ?? {}, { partial: true });
    const [row] = await db.update('navigation_items', `id=${eq(nid)}`, f);
    if (!row) throw Object.assign(new InputError('Menu item not found'), { status: 404 });
    await log('update', 'nav', nid, { fields: Object.keys(f) });
    return row;
  },
  async nav_delete({ db, log }, { id }) {
    const nid = requireUuid(id);
    const [row] = await db.remove('navigation_items', `id=${eq(nid)}`);
    if (!row) throw Object.assign(new InputError('Menu item not found'), { status: 404 });
    await log('delete', 'nav', nid, { key: row.nav_key });
    return { id: nid };
  },
  async nav_reorder({ db, log }, { ids }) {
    if (!Array.isArray(ids) || !ids.length || ids.length > 50) throw new InputError('ids must be a list');
    const clean = ids.map((x, i) => requireUuid(x, `ids[${i}]`));
    for (const [i, nid] of clean.entries()) await db.update('navigation_items', `id=${eq(nid)}`, { sort_order: (i + 1) * 10 });
    await log('reorder', 'nav', null, { count: clean.length });
    return { count: clean.length };
  },
};

// ---------------------------------------------------------------------------
// Blog
// ---------------------------------------------------------------------------
const API_DIR = path.dirname(fileURLToPath(import.meta.url));
function fileBasedPostIds() {
  try {
    return new Set(JSON.parse(fs.readFileSync(path.join(API_DIR, '..', '..', 'blog', 'posts.json'), 'utf8')).map((p) => p.id));
  } catch {
    return new Set();
  }
}

const blog = {
  async list({ db }) {
    return db.select('blog_posts', 'select=id,slug,locale,title,status,published_at,deleted_at,updated_at,categories&order=updated_at.desc');
  },
  async get({ db }, { id }) {
    return one(await db.select('blog_posts', `select=*&id=${eq(requireUuid(id))}`), 'Post');
  },
  async create({ db, log }, { fields }) {
    const f = validate('blog_posts', fields ?? {}, { required: ['title'] });
    f.slug ??= slugify(f.title).slice(0, 100);
    if (fileBasedPostIds().has(f.slug)) throw Object.assign(new InputError('A post with this slug already exists in the site files'), { status: 409 });
    f.status = 'draft';
    const [row] = await db.insert('blog_posts', f);
    await log('create', 'post', row.id, { slug: row.slug });
    return row;
  },
  async update({ db, log }, { id, fields }) {
    const bid = requireUuid(id);
    const f = validate('blog_posts', fields ?? {}, { partial: true });
    if (f.slug && fileBasedPostIds().has(f.slug)) throw Object.assign(new InputError('A post with this slug already exists in the site files'), { status: 409 });
    const [row] = await db.update('blog_posts', `id=${eq(bid)}`, f);
    if (!row) throw Object.assign(new InputError('Post not found'), { status: 404 });
    await log('update', 'post', bid, { fields: Object.keys(f) });
    return row;
  },
  /** Publish now, or schedule by giving a future published_at. */
  async publish({ db, log }, { id, published_at }) {
    const bid = requireUuid(id);
    const when = published_at === undefined ? new Date().toISOString() : T.date(published_at, 'published_at');
    const [row] = await db.update('blog_posts', `id=${eq(bid)}&deleted_at=is.null`, { status: 'published', published_at: when });
    if (!row) throw Object.assign(new InputError('Post not found'), { status: 404 });
    await log(new Date(when) > new Date() ? 'schedule_post' : 'publish_post', 'post', bid, { slug: row.slug, published_at: when });
    return row;
  },
  async unpublish({ db, log }, { id }) {
    const bid = requireUuid(id);
    const [row] = await db.update('blog_posts', `id=${eq(bid)}`, { status: 'draft' });
    if (!row) throw Object.assign(new InputError('Post not found'), { status: 404 });
    await log('unpublish_post', 'post', bid, { slug: row.slug });
    return row;
  },
  async delete({ db, log }, { id }) {
    const bid = requireUuid(id);
    const [row] = await db.update('blog_posts', `id=${eq(bid)}&deleted_at=is.null`, { deleted_at: new Date().toISOString() });
    if (!row) throw Object.assign(new InputError('Post not found or already in the trash'), { status: 404 });
    await log('trash', 'post', bid, { slug: row.slug });
    return row;
  },
  async restore({ db, log }, { id }) {
    const bid = requireUuid(id);
    const [row] = await db.update('blog_posts', `id=${eq(bid)}&deleted_at=not.is.null`, { deleted_at: null });
    if (!row) throw Object.assign(new InputError('Post is not in the trash'), { status: 404 });
    await log('restore', 'post', bid, { slug: row.slug });
    return row;
  },
  async purge({ db, log }, { id }) {
    const bid = requireUuid(id);
    const [row] = await db.remove('blog_posts', `id=${eq(bid)}&deleted_at=not.is.null`);
    if (!row) throw new InputError('Only posts in the trash can be deleted permanently');
    await log('purge', 'post', bid, { slug: row.slug });
    return { id: bid };
  },
};

// ---------------------------------------------------------------------------
// Activity log and publishing
// ---------------------------------------------------------------------------
const activity = {
  async list({ db }, { before, limit }) {
    const n = limit === undefined ? 50 : T.int(1, 200)(limit, 'limit');
    const cursor = before === undefined ? '' : `&id=lt.${T.int(1, Number.MAX_SAFE_INTEGER)(before, 'before')}`;
    return db.select('activity_logs', `select=*&order=id.desc&limit=${n}${cursor}`);
  },
};

const DEPLOY_HOOK = /^https:\/\/api\.vercel\.com\/v1\/integrations\/deploy\/[A-Za-z0-9_]+\/[A-Za-z0-9_]+$/;

const publish = {
  /** Rebuilds the public site so saved changes go live (Vercel Deploy Hook). */
  async run({ log }) {
    const hook = process.env.VERCEL_DEPLOY_HOOK_URL || '';
    if (!DEPLOY_HOOK.test(hook)) {
      throw Object.assign(new InputError('Publishing is not set up: add VERCEL_DEPLOY_HOOK_URL in Vercel'), { status: 412 });
    }
    const r = await fetch(hook, { method: 'POST', signal: AbortSignal.timeout(8000) });
    if (!r.ok) throw Object.assign(new Error(`Vercel did not accept the rebuild (${r.status})`), { status: 502 });
    const job = await r.json().catch(() => ({}));
    await log('publish', 'site', null, { job: job?.job?.id ?? null });
    return { started: true, job: job?.job?.id ?? null };
  },
};

// ---------------------------------------------------------------------------
// Contact messages and app update notices (tables from db/SUPABASE_CONTACT_FIX.sql
// and db/SUPABASE_APP_UPDATES.sql, moved here from the older dashboard)
// ---------------------------------------------------------------------------
const messages = {
  async list({ db }) {
    return db.select('contact_messages', 'select=id,name,email,message,created_at&order=created_at.desc&limit=200');
  },
  async delete({ db, log }, { id }) {
    if (!Number.isSafeInteger(id) || id <= 0) throw new InputError('id must be a message id');
    const [row] = await db.remove('contact_messages', `id=${eq(id)}`);
    if (!row) throw Object.assign(new InputError('Message not found'), { status: 404 });
    await log('delete_message', 'message', String(id), {});
    return { id };
  },
};

const APP_ID = /^[a-z][a-z0-9_]*(\.[a-z0-9_]+){1,5}$/;
const appUpdates = {
  async list({ db }) {
    return db.select('app_updates', 'select=*&order=app_id.asc');
  },
  /** Publishes the "new version available" notice the installed apps read. */
  async save({ db, log }, { app_id, name, version, url, notes, release_date }) {
    if (typeof app_id !== 'string' || !APP_ID.test(app_id)) throw new InputError('app_id must look like com.example.app');
    const row = {
      app_id,
      name: T.optStr(80)(name ?? null, 'name'),
      version: (() => {
        const v = T.str(30, { min: 1 })(version, 'version');
        if (!/^\d+(\.\d+){0,3}([-+][0-9A-Za-z.-]+)?$/.test(v)) throw new InputError('version must look like 1.2.3');
        return v;
      })(),
      url: T.url(url ?? null, 'url'),
      notes: T.optStr(2000)(notes ?? null, 'notes'),
      release_date: release_date ? T.date(release_date, 'release_date').slice(0, 10) : null,
    };
    const [saved] = await db.upsert('app_updates', row, 'app_id');
    await log('publish_app_update', 'app_update', app_id, { version: row.version });
    return saved;
  },
};

export const HANDLERS = { overview, projects, categories, github, media, content, blog, activity, publish, messages, updates: appUpdates };
export { sniffImage };
