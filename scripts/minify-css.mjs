import fs from 'node:fs';
import path from 'node:path';
import CleanCSS from 'clean-css';

/**
 * Regenerates css/style.min.css from css/style.css.
 *
 * Runs as a build step (see package.json "build") so the committed
 * style.min.css can never silently drift back into being an unminified
 * copy of style.css — it is always the direct output of this script.
 */

const ROOT = process.cwd();
const SRC = path.join(ROOT, 'css', 'style.css');
const OUT = path.join(ROOT, 'css', 'style.min.css');

const input = fs.readFileSync(SRC, 'utf8');
const result = new CleanCSS({ level: 2 }).minify(input);

if (result.errors.length) {
  console.error('CSS minification failed:');
  for (const e of result.errors) console.error('  - ' + e);
  process.exit(1);
}

fs.writeFileSync(OUT, result.styles);

const before = Buffer.byteLength(input, 'utf8');
const after = Buffer.byteLength(result.styles, 'utf8');
console.log(
  `css/style.min.css: ${before} -> ${after} bytes (-${(100 - (after / before) * 100).toFixed(1)}%)`
);
