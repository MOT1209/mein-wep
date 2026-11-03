#!/usr/bin/env node
/**
 * Prebuild step: copy the published CMS content from Supabase into
 * .cms-cache/cms.json for this build (see scripts/cms/source.mjs).
 *
 * Reads with the publishable key only, so Row Level Security returns exactly
 * what a visitor may see: public, non-deleted projects; visible navigation;
 * public settings; published blog posts whose date has passed.
 *
 * Outcomes:
 *   - SUPABASE_URL / SUPABASE_ANON_KEY unset -> no cache, the build uses git
 *   - tables missing (migration not applied)  -> no cache, warning
 *   - database empty (seed not run)           -> no cache, warning
 *   - network or server error                 -> no cache, warning; with
 *     CMS_REQUIRED=1 the build fails instead, so production never silently
 *     falls back once the CMS is live.
 */
import fs from 'node:fs';
import path from 'node:path';
import { CACHE_FILE } from './cms/source.mjs';

const TIMEOUT_MS = 10_000;
const ATTEMPTS = 3;

const log = (msg) => console.log(`[cms] ${msg}`);

function removeCache() {
  fs.rmSync(CACHE_FILE, { force: true });
}

class Missing extends Error {}

async function get(base, key, pathAndQuery) {
  let lastErr;
  for (let i = 0; i < ATTEMPTS; i += 1) {
    try {
      const r = await fetch(`${base}/rest/v1/${pathAndQuery}`, {
        headers: { apikey: key, Accept: 'application/json' },
        signal: AbortSignal.timeout(TIMEOUT_MS),
      });
      if (r.status === 404) throw new Missing(pathAndQuery.split('?')[0]);
      if (!r.ok) {
        const body = await r.text();
        // PGRST205/42P01: relation not found -> migration not applied.
        if (/PGRST205|42P01|does not exist/.test(body)) throw new Missing(pathAndQuery.split('?')[0]);
        throw new Error(`${r.status} ${body.slice(0, 200)}`);
      }
      return await r.json();
    } catch (err) {
      if (err instanceof Missing) throw err;
      lastErr = err;
      await new Promise((res) => setTimeout(res, 500 * 2 ** i));
    }
  }
  throw lastErr;
}

export async function fetchCms({ url, key, now = new Date() }) {
  const base = url.replace(/\/+$/, '');
  const studioSelect = [
    '*',
    'category:project_categories(slug,name,name_de,name_ar)',
    'repo:github_repositories(full_name,html_url,language,is_archived,description)',
    'images:project_images(url,alt,sort_order)',
  ].join(',');
  const [studio, categories, nav, settings, pages, blog] = await Promise.all([
    get(base, key, `studio_projects?select=${encodeURIComponent(studioSelect)}&visibility=eq.public&deleted_at=is.null&order=sort_order.asc,title.asc`),
    get(base, key, 'project_categories?select=slug,name,name_de,name_ar,sort_order&order=sort_order.asc'),
    get(base, key, 'navigation_items?select=nav_key,label,label_de,label_ar,href,sort_order&visible=eq.true&order=sort_order.asc'),
    get(base, key, 'website_settings?select=key,value&is_public=eq.true'),
    get(base, key, 'website_pages?select=page_key,locale,content'),
    get(base, key, `blog_posts?select=slug,locale,title,description,body_md,cover_image,cover_alt,categories,tags,published_at,seo_title,seo_description,updated_at&status=eq.published&deleted_at=is.null&published_at=lte.${encodeURIComponent(now.toISOString())}&order=published_at.desc`),
  ]);
  return {
    fetchedAt: now.toISOString(),
    source: base,
    studio,
    categories,
    nav,
    settings: Object.fromEntries(settings.map((s) => [s.key, s.value])),
    pages,
    blog,
  };
}

async function main() {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_ANON_KEY;
  const required = process.env.CMS_REQUIRED === '1';
  removeCache();
  if (!url || !key || process.env.CMS_DISABLE === '1') {
    log('Supabase not configured for this build: using the content in git.');
    if (required) throw new Error('CMS_REQUIRED=1 but SUPABASE_URL / SUPABASE_ANON_KEY are not set');
    return;
  }
  try {
    const data = await fetchCms({ url, key });
    if (!data.categories.length && !data.studio.length) {
      log('CMS tables are empty (seed not run): using the content in git.');
      if (required) throw new Error('CMS_REQUIRED=1 but the CMS has no content');
      return;
    }
    fs.mkdirSync(path.dirname(CACHE_FILE), { recursive: true });
    fs.writeFileSync(CACHE_FILE, JSON.stringify(data));
    log(`using Supabase: ${data.studio.length} public projects, ${data.nav.length} nav items, ${data.blog.length} posts.`);
  } catch (err) {
    removeCache();
    const reason = err instanceof Missing ? `table ${err.message} not found (migration not applied?)` : err.message;
    if (required) throw new Error(`CMS fetch failed: ${reason}`);
    log(`WARNING: CMS fetch failed (${reason}): using the content in git.`);
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch((err) => {
    console.error(`[cms] ${err.message}`);
    process.exit(1);
  });
}
