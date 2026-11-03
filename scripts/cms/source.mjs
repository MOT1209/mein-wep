/**
 * Where the build reads editable content from.
 *
 * `npm run build` first runs scripts/fetch-cms.mjs, which reads the published
 * content from Supabase (publishable key, Row Level Security) and writes it to
 * .cms-cache/cms.json. Everything that renders content imports this module:
 *
 *   - _data/kingStudio.js        the catalogue and its pages
 *   - scripts/site-templates.mjs the URL list the verify gate compares against
 *   - _data/cms.js               navigation, settings, pages, blog posts
 *
 * so the build and the gate always agree. Without a cache (no Supabase env,
 * the migration not applied yet, or a failed fetch) the files in git are used,
 * exactly as before the CMS existed.
 */
import fs from 'node:fs';
import path from 'node:path';

// CMS_CACHE_FILE lets tests build from a fixture without touching the real cache.
export const CACHE_FILE = process.env.CMS_CACHE_FILE || path.join(process.cwd(), '.cms-cache', 'cms.json');

let cached;
export function cmsCache() {
  if (cached !== undefined) return cached;
  try {
    cached = JSON.parse(fs.readFileSync(CACHE_FILE, 'utf8'));
  } catch {
    cached = null;
  }
  return cached;
}

/** For tests: forget the memoised cache. */
export function resetCmsCache() {
  cached = undefined;
}

const clean = (o) => Object.fromEntries(Object.entries(o).filter(([, v]) => v !== null && v !== undefined && v !== ''));

/**
 * One studio_projects row (with its embedded category, repository and images)
 * in the record shape of _data/studioCatalog.json, so _data/kingStudio.js
 * validates and renders both sources the same way.
 */
export function mapDbProject(row) {
  const cat = row.category || null;
  const repo = row.repo || null;
  const i18n = {};
  for (const l of ['de', 'ar']) {
    const t = clean({ ...(row.i18n?.[l] ?? {}), category: cat?.[`name_${l}`] });
    if (Object.keys(t).length) i18n[l] = t;
  }
  return clean({
    id: row.slug,
    section: row.section,
    title: row.title,
    description: row.short_description || repo?.description || '',
    longDescription: row.description,
    type: row.project_type,
    category: cat?.name,
    categorySlug: cat?.slug,
    platforms: row.platforms ?? [],
    technologies: row.technologies ?? [],
    features: row.features ?? [],
    status: row.status,
    featured: !!row.featured,
    image: row.cover_image,
    imageAlt: row.image_alt,
    launchUrl: row.launch_url,
    demoUrl: row.demo_url,
    externalDownloadUrl: row.download_url,
    apkId: row.apk_id,
    githubUrl: repo?.html_url,
    githubLanguage: repo?.language,
    githubArchived: repo ? !!repo.is_archived : undefined,
    gallery: (row.images ?? [])
      .slice()
      .sort((a, b) => a.sort_order - b.sort_order)
      .map((im) => ({ url: im.url, alt: im.alt })),
    sortOrder: row.sort_order,
    i18n,
  });
}

/** The catalogue records the build renders, hidden ones removed. */
export function studioRecords() {
  const c = cmsCache();
  if (c?.studio) return c.studio.map(mapDbProject);
  const raw = JSON.parse(fs.readFileSync(path.join(process.cwd(), '_data', 'studioCatalog.json'), 'utf8'));
  return raw.projects.filter((p) => !p.hidden);
}

/**
 * APK ids whose project is not public. Their files stay at their URLs (old
 * links keep working) but downloads.html and the homepage do not list them.
 * An APK that belongs to no catalogue record at all is listed as before.
 */
export function hiddenApkIds() {
  const raw = JSON.parse(fs.readFileSync(path.join(process.cwd(), '_data', 'studioCatalog.json'), 'utf8')).projects;
  const visible = new Set(studioRecords().map((p) => p.apkId).filter(Boolean));
  return new Set(raw.map((p) => p.apkId).filter((id) => id && !visible.has(id)));
}
