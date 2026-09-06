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
export const TEMPLATE_OUTPUTS = {
  'index.njk': 'index.html',
};

export const TEMPLATE_SOURCES = new Set(Object.keys(TEMPLATE_OUTPUTS));
