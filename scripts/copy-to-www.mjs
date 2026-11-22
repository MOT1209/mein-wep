/**
 * copy-to-www.mjs
 * Copies necessary web files into www/ for Capacitor builds.
 *
 * Usage: node scripts/copy-to-www.mjs apps/quran-app
 *        node scripts/copy-to-www.mjs games/kingcraft-game
 *
 * It auto-detects the project directory and copies:
 *   index.html, manifest.json, sw.js, version.json,
 *   css/, js/, icons/, images/, screenshots/
 */

// CI: rebuild trigger after JDK 21 upgrade + race-safe APK push for Capacitor 8.
import fs from 'fs';
import path from 'path';
import { fileURLToPath, pathToFileURL } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');

// assets/: Farm World loads its textures from assets/textures/ at runtime.
const DIRS_TO_COPY = ['css', 'js', 'icons', 'images', 'screenshots', 'fonts', 'assets'];
const FILES_TO_COPY = ['index.html', 'manifest.json', 'sw.js', 'version.json'];

function copyDir(src, dest) {
  if (!fs.existsSync(src)) return;
  fs.mkdirSync(dest, { recursive: true });
  for (const entry of fs.readdirSync(src, { withFileTypes: true })) {
    const s = path.join(src, entry.name);
    const d = path.join(dest, entry.name);
    if (entry.isDirectory()) {
      copyDir(s, d);
    } else {
      fs.copyFileSync(s, d);
    }
  }
}

function copyFile(src, dest) {
  if (fs.existsSync(src)) {
    fs.mkdirSync(path.dirname(dest), { recursive: true });
    fs.copyFileSync(src, dest);
  }
}

/**
 * Shared site scripts referenced as "../../js/<path>.js" (also in a sub-folder,
 * such as ../../js/vendor/admob.js). Returns the HTML with those references
 * pointing into www/js/ and the list of paths (relative to the repo's js/) to
 * copy there. Path segments must start with a word character, so ".." can
 * never climb out of js/.
 */
export function rewriteSharedRefs(html) {
  const ref = /((?:src|href)=")\.\.\/\.\.\/js\/(\w[\w.-]*(?:\/\w[\w.-]*)*\.js)"/g;
  const files = [...new Set([...html.matchAll(ref)].map((m) => m[2]))];
  return { html: html.replace(ref, '$1js/$2"'), files };
}

function main() {
  const projectArg = process.argv[2];
  if (!projectArg) {
    console.error('Usage: node scripts/copy-to-www.mjs <project-dir>');
    console.error('Example: node scripts/copy-to-www.mjs apps/quran-app');
    process.exit(1);
  }

  // Resolve the project against the current working directory so that both
  // `node scripts/copy-to-www.mjs apps/quiz-app` (from repo root) and
  // `node ../../scripts/copy-to-www.mjs .` (from inside the app dir, as CI does)
  // point at the right folder. Resolving against ROOT broke the `.` form,
  // creating www/ at the repo root instead of inside the app → cap sync failed.
  const projectDir = path.resolve(process.cwd(), projectArg);
  if (!fs.existsSync(projectDir)) {
    console.error(`Project directory not found: ${projectDir}`);
    process.exit(1);
  }

  const wwwDir = path.join(projectDir, 'www');
  console.log(`📦 Copying web assets to www/ for ${projectArg}...`);

  // Clean www/
  if (fs.existsSync(wwwDir)) {
    fs.rmSync(wwwDir, { recursive: true, force: true });
  }
  fs.mkdirSync(wwwDir, { recursive: true });

  // Copy individual files
  for (const file of FILES_TO_COPY) {
    copyFile(path.join(projectDir, file), path.join(wwwDir, file));
  }

  // Copy directories
  for (const dir of DIRS_TO_COPY) {
    const srcDir = path.join(projectDir, dir);
    const destDir = path.join(wwwDir, dir);
    copyDir(srcDir, destDir);
  }

  // Special handling: for KingCraft, also copy dist/ assets
  const distDir = path.join(projectDir, 'dist');
  if (fs.existsSync(distDir)) {
    const distAssets = path.join(distDir, 'assets');
    if (fs.existsSync(distAssets)) {
      copyDir(distAssets, path.join(wwwDir, 'assets'));
    }
    // Copy any generated HTML files from dist
    for (const f of fs.readdirSync(distDir)) {
      if (f.endsWith('.html')) {
        copyFile(path.join(distDir, f), path.join(wwwDir, f));
      }
    }
  }

  // Shared cross-project scripts (e.g. js/unified-game-controls.js) live at
  // the repo root and are referenced from game HTML as "../../js/<name>.js" —
  // that resolves fine on the live site, but www/ is bundled as a
  // self-contained root for the native app, so "../../" has nothing above it
  // to point at. Copy the referenced shared file into www/js/ and rewrite the
  // reference to match, for the packaged build only (source HTML is untouched).
  // Runs last so it processes the final index.html, including KingCraft's
  // dist/-generated one from the block above.
  const indexHtmlDest = path.join(wwwDir, 'index.html');
  if (fs.existsSync(indexHtmlDest)) {
    let html = fs.readFileSync(indexHtmlDest, 'utf8');
    const shared = rewriteSharedRefs(html);
    if (shared.files.length) {
      for (const rel of shared.files) {
        copyFile(path.join(ROOT, 'js', rel), path.join(wwwDir, 'js', rel));
      }
      html = shared.html;
      fs.writeFileSync(indexHtmlDest, html);
      console.log(`🔗 Rewrote ${shared.files.length} shared js/ reference(s) for native bundling`);
    }
  }

  console.log(`✅ www/ ready at ${wwwDir}`);
  console.log(`   ${fs.readdirSync(wwwDir).length} items copied`);
}

// Run only as a script, so tests can import rewriteSharedRefs.
if (process.argv[1] && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href) main();
