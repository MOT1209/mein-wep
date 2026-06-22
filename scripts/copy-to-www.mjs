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

// CI: rebuild trigger after JDK 21 upgrade for Capacitor 8.
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');

const DIRS_TO_COPY = ['css', 'js', 'icons', 'images', 'screenshots', 'fonts'];
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

  console.log(`✅ www/ ready at ${wwwDir}`);
  console.log(`   ${fs.readdirSync(wwwDir).length} items copied`);
}

main();
