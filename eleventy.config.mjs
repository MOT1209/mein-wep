import { execSync } from 'node:child_process';

/**
 * Eleventy config for the Rashid portfolio static site.
 *
 * Strategy: only `.njk` files are templates. Everything else is copied
 * verbatim via passthrough, and the passthrough list is generated directly
 * from `git ls-files`, so:
 *   - dist/ can only ever contain git-tracked + served paths
 *   - node_modules, .git, dot-dirs and local tooling never get copied at all
 *   - the main file search (which does the njk scan) honors .gitignore and
 *     .eleventyignore so templates never come from excluded dirs
 *
 * Hard rules:
 *  - Sub-projects (games/, apps/, models/, admin/, vault/, okf/, api/) are
 *    NEVER templates — copied verbatim at identical relative paths.
 *  - The deployed URL surface must stay identical to today's (see
 *    scripts/check-url-surface.mjs which enforces it).
 */

// Files that exist locally for the build but must never be served.
// Mirrors NOT_SERVED in scripts/check-url-surface.mjs.
const NOT_SERVED = [
  /^dist\//,
  /^node_modules\//,
  /^package(?:-lock)?\.json$/,
  /^eleventy\.config\.mjs$/,
  /^\.eleventyignore$/,
  /^_data\//,
  /^_includes\//,
  /^scripts\/check-url-surface\.mjs$/,
];

// Mirror .vercelignore exclusion patterns applied to the git-tracked tree.
// Mirrors VERCEL_IGNORE in scripts/check-url-surface.mjs.
const VERCEL_IGNORE = [
  /\/android\//,
  /\/\.gradle\//,
  /\.apk$/,
  /\.aab$/,
  /\.jks$/,
  /\.keystore$/,
  /keystore\.properties$/,
  /\/node_modules\//,
  /\/dist\//,
  /\/www\//,
  /\/\.idea\//,
  /\.log$/,
  /^\.agents\//,
  /^\.opencode\//,
  /^\.testsprite\//,
];

function servedFiles() {
  const tracked = execSync('git ls-files', { encoding: 'utf8' })
    .split('\n')
    .map((l) => l.trim())
    .filter(Boolean)
    .filter((p) => {
      if (NOT_SERVED.some((re) => re.test(p))) return false;
      if (VERCEL_IGNORE.some((re) => re.test(p))) return false;
      return true;
    });
  return tracked;
}

export default function (eleventyConfig) {
  eleventyConfig.setTemplateFormats(['njk']);

  eleventyConfig.ignores.add('**/node_modules/**');
  eleventyConfig.ignores.add('dist/**');
  eleventyConfig.ignores.add('.git/**');
  eleventyConfig.ignores.add('_data/**');
  eleventyConfig.ignores.add('_includes/**');

  const served = servedFiles();
  const topLevelDirs = [...new Set(served.map((p) => p.split('/')[0]))];
  const rootFiles = served.filter((p) => !p.includes('/'));

  for (const dir of topLevelDirs.sort()) {
    eleventyConfig.addPassthroughCopy(dir);
  }
  for (const file of rootFiles.sort()) {
    eleventyConfig.addPassthroughCopy(file);
  }

  return {
    dir: {
      input: '.',
      output: 'dist',
      includes: '_includes',
      data: '_data',
    },
    pathPrefix: '/',
  };
}