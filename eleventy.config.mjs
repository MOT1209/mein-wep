import { execSync } from 'node:child_process';
import { TEMPLATE_SOURCES } from './scripts/site-templates.mjs';

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
  /^\.eleventyignore$/,
  /^_data\//,
  /^_includes\//,
  /^tests\//,
  /^scripts\/check-url-surface\.mjs$/,
  /^scripts\/site-templates\.mjs$/,
  /^scripts\/apk-release-policy\.mjs$/,
];

// Mirror .vercelignore exclusion patterns applied to the git-tracked tree.
// Mirrors VERCEL_IGNORE in scripts/check-url-surface.mjs.
const VERCEL_IGNORE = [
  /\/android\//,
  /\/\.gradle\//,
  // Deliberately NOT /\.apk$/ here: every tracked .apk lives under apks/,
  // the intentional public release folder linked from downloads.html.
  // Stray android build .apk output is already caught by /android\// and
  // /\.gradle\// above (it always lives inside one of those directories),
  // so a blanket .apk rule only serves to break real downloads once
  // passthrough copying is done per-file instead of per-directory.
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
  // Unrelated sub-projects and internal tooling that live in this repo but
  // are not part of the served site — none of these are linked from any
  // page. Listed here (not just as a stray top-level dir) so they can never
  // reach dist/ again regardless of how passthrough copying is wired.
  /^linguaverse\//,
  /^denkmalen\//,
  /^mcp\//,
  /^notebooks\//,
  /^tools\//,
  /^agents\//,
  /^docs\//,
  /^\.pi\//,
  // Internal docs, tooling config, DB schema and unrelated backends — never
  // linked from any page. Root-level *.md only: okf/*.md is served on purpose.
  /^\.claude\//,
  /^\.github\//,
  /^\.vscode\//,
  /^[^/]+\.md$/,
  /^apks\/[^/]+\.md$/,
  /^db\//,
  /^render\.yaml$/,
  /^skills-lock\.json$/,
  /^king-colab-MCP\//,
  /^apps\/chat-app\//,
  /^روابط-الإدارة\.txt$/,
  /^تقرير-مراجعة-المشروع\.html$/,
  /__pycache__\//,
  /\.pyc$/,
];

function servedFiles() {
  // `-z` + null-byte splitting (not plain `git ls-files`) is required here:
  // git otherwise quotes non-ASCII filenames as octal escape sequences
  // (e.g. a Arabic filename becomes the literal string `"\330\252..."`),
  // which silently fails to match anything on disk and drops that file
  // from every passthrough copy.
  const tracked = execSync('git ls-files -z', { encoding: 'utf8' })
    .split('\0')
    .map((l) => l.trim())
    .filter(Boolean)
    .filter((p) => {
      if (NOT_SERVED.some((re) => re.test(p))) return false;
      if (VERCEL_IGNORE.some((re) => re.test(p))) return false;
      // Eleventy renders these itself; passing them to addPassthroughCopy
      // would also emit the unrendered source (dist/index.njk) next to the
      // rendered page. See scripts/site-templates.mjs.
      if (TEMPLATE_SOURCES.has(p)) return false;
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

  // Passthrough copy is registered per served FILE (not per top-level
  // directory). Directory-level passthrough (addPassthroughCopy('apps'))
  // copies a directory verbatim from disk and does not apply VERCEL_IGNORE
  // to files nested inside it — that previously let excluded content
  // (e.g. an android/ build folder under a sub-project) ride along with
  // its legitimately-served siblings. Per-file passthrough closes that gap
  // structurally: nothing reaches dist/ that servedFiles() didn't name.
  for (const file of servedFiles().sort()) {
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