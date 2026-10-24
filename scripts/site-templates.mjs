/**
 * Single source of truth for which source files are Eleventy templates
 * and what output path each one renders to.
 *
 * Both `eleventy.config.mjs` and `scripts/check-url-surface.mjs` import this,
 * so the build and the URL-surface parity gate can never disagree about it:
 *
 *  - eleventy.config.mjs skips these sources when registering passthrough
 *    copies (otherwise `index.njk` would be copied verbatim into dist/
 *    alongside the rendered `index.html`).
 *
 *  - check-url-surface.mjs maps each source name to its rendered output name
 *    before comparing `git ls-files` against dist/, since git knows the page
 *    as `index.njk` while dist/ contains `index.html`.
 *
 * A page added here MUST carry an explicit `permalink` in its front matter
 * unless it is the root index — Eleventy otherwise rewrites `about.njk` to
 * `about/index.html`, which silently changes the deployed URL.
 */
import fs from 'node:fs';

// King Studio detail pages come from one paginated template
// (king-studio/project.njk), so that single source renders one output per
// catalogue record. Derived from the same JSON the build reads, so the
// URL-surface gate and the build can never disagree about which pages exist.
const studioProjects = JSON.parse(
  fs.readFileSync(new URL('../_data/studioCatalog.json', import.meta.url), 'utf8'),
).projects.filter((p) => !p.hidden);

// Blog index and posts are templates (shared header/footer) that keep their
// original .html URLs via explicit permalinks.
const blogPages = Object.fromEntries(
  fs.readdirSync(new URL('../blog/', import.meta.url))
    .filter((f) => f.endsWith('.njk'))
    .map((f) => [`blog/${f}`, `blog/${f.replace(/\.njk$/, '.html')}`]),
);

/**
 * Value is one output path, or an array when a single template renders
 * several pages (pagination).
 */
export const TEMPLATE_OUTPUTS = {
  'index.njk': 'index.html',
  'terms.njk': 'terms.html',
  'about.njk': 'about.html',
  'contact.njk': 'contact.html',
  'privacy.njk': 'privacy.html',
  'downloads.njk': 'downloads.html',
  '404.njk': '404.html',
  'learning.njk': 'learning.html',
  // Translated versions of the core pages (see _data/i18n and site.translations).
  'de/index.njk': 'de/index.html',
  'de/about.njk': 'de/about.html',
  'de/contact.njk': 'de/contact.html',
  'ar/index.njk': 'ar/index.html',
  'ar/about.njk': 'ar/about.html',
  'ar/contact.njk': 'ar/contact.html',
  ...blogPages,
  // King Studio in every language: '' (English), 'de/', 'ar/'.
  ...Object.fromEntries(['', 'de/', 'ar/'].flatMap((prefix) => [
    [`${prefix}king-studio/index.njk`, `${prefix}king-studio/index.html`],
    [`${prefix}king-studio/games.njk`, `${prefix}king-studio/games/index.html`],
    [`${prefix}king-studio/apps.njk`, `${prefix}king-studio/apps/index.html`],
    [`${prefix}king-studio/labs.njk`, `${prefix}king-studio/labs/index.html`],
    [`${prefix}king-studio/project.njk`, studioProjects.map((p) => `${prefix}king-studio/${p.section}/${p.id}/index.html`)],
  ])),
};

export const TEMPLATE_SOURCES = new Set(Object.keys(TEMPLATE_OUTPUTS));
