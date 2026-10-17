import fs from 'node:fs';
import path from 'node:path';

/**
 * King Studio catalogue.
 *
 * Raw records live in studioCatalog.json (data only). This module validates
 * them against the real repository and derives every URL, so a catalogue
 * entry can never publish a launch link, image or APK that does not exist:
 * the build fails instead.
 *
 * APK links and versions come from apks/updates.json, the same manifest the
 * release bot maintains and the homepage reads.
 */
const ROOT = process.cwd();
const STATUSES = ['Available', 'In Development', 'Experimental', 'Coming Soon'];
const SECTIONS = {
  games: { label: 'Games', title: 'Games' },
  apps: { label: 'Apps', title: 'Applications' },
  labs: { label: 'Labs', title: 'Labs & experiments' },
};
const STATUS_TONE = {
  Available: 'ok',
  'In Development': 'dev',
  Experimental: 'exp',
  'Coming Soon': 'soon',
};

const exists = (rel) => fs.existsSync(path.join(ROOT, rel));
// A directory URL ("games/x/") is valid when it has an index.html.
const resolvesInRepo = (rel) => (rel.endsWith('/') ? exists(rel + 'index.html') : exists(rel));

function fail(id, msg) {
  throw new Error(`[king-studio] ${id}: ${msg}`);
}

/**
 * Filter chips are only worth rendering when they can change the result: a
 * platform chip must be on some projects but not all of them, and status chips
 * need at least two distinct statuses. Otherwise the control would be
 * decoration.
 */
function facetsFor(items) {
  const facets = [];
  const platforms = [...new Set(items.flatMap((p) => p.platforms))];
  for (const value of platforms) {
    const n = items.filter((p) => p.platforms.includes(value)).length;
    if (n < items.length) facets.push({ kind: 'platform', value });
  }
  const statuses = STATUSES.filter((s) => items.some((p) => p.status === s));
  if (statuses.length > 1) for (const value of statuses) facets.push({ kind: 'status', value });
  return facets;
}

export default function () {
  const raw = JSON.parse(fs.readFileSync(path.join(ROOT, '_data', 'studioCatalog.json'), 'utf8'));
  const releases = JSON.parse(fs.readFileSync(path.join(ROOT, 'apks', 'updates.json'), 'utf8')).apps ?? {};
  const seen = new Set();

  const projects = raw.projects.map((p) => {
    for (const k of ['id', 'section', 'title', 'description', 'type', 'status']) {
      if (!p[k]) fail(p.id ?? '?', `missing required field "${k}"`);
    }
    if (seen.has(p.id)) fail(p.id, 'duplicate id');
    seen.add(p.id);
    if (!SECTIONS[p.section]) fail(p.id, `unknown section "${p.section}"`);
    if (!STATUSES.includes(p.status)) fail(p.id, `unknown status "${p.status}"`);
    if (p.image && !exists(p.image)) fail(p.id, `image not found: ${p.image}`);
    if (p.image && !p.imageAlt) fail(p.id, 'image requires imageAlt');
    if (p.launchUrl && !resolvesInRepo(p.launchUrl)) fail(p.id, `launchUrl does not resolve: ${p.launchUrl}`);
    if (p.status === 'Coming Soon' && p.launchUrl) {
      fail(p.id, 'a "Coming Soon" project must not have a launchUrl');
    }

    let downloadUrl;
    let version;
    if (p.apkId) {
      const rel = releases[p.apkId];
      if (!rel) fail(p.id, `apkId "${p.apkId}" not in apks/updates.json`);
      const file = rel.url.replace(/^\//, '');
      if (!exists(file)) fail(p.id, `APK file missing: ${file}`);
      downloadUrl = file;
      version = rel.version;
    }

    return {
      ...p,
      platforms: p.platforms ?? [],
      technologies: p.technologies ?? [],
      features: p.features ?? [],
      downloadUrl,
      version,
      tone: STATUS_TONE[p.status],
      detailUrl: `king-studio/${p.section}/${p.id}/`,
      searchText: [p.title, p.description, p.category, ...(p.platforms ?? []), ...(p.technologies ?? [])]
        .filter(Boolean)
        .join(' ')
        .toLowerCase(),
    };
  });

  const bySection = (s) => projects.filter((p) => p.section === s);
  const sections = Object.fromEntries(
    Object.entries(SECTIONS).map(([key, meta]) => [key, { ...meta, key, projects: bySection(key), facets: facetsFor(bySection(key)), showSearch: bySection(key).length > 6 }]),
  );

  return {
    projects,
    sections,
    featured: {
      games: bySection('games').filter((p) => p.featured),
      apps: bySection('apps').filter((p) => p.featured),
      labs: bySection('labs').filter((p) => p.featured),
    },
  };
}
