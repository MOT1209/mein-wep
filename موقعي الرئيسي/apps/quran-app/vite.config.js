// ==================== Quran Pro - Vite Build Configuration ====================
// يبني نسخة إنتاج مضغوطة مع الحفاظ على السكربتات الكلاسيكية والـ globals.
//
// Two modes:
//   vite build                  → web build (Vercel). Includes the OTA updater.
//   vite build --mode android   → APK/AAB build. Strips the OTA updater, because
//                                 a Play-distributed app must not offer to
//                                 download or install an APK from outside Play
//                                 (Device and Network Abuse policy).

import { defineConfig } from 'vite';
import { transform } from 'esbuild';
import {
  copyFile,
  cp,
  mkdir,
  readFile,
  rm,
  writeFile,
} from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { dirname, join } from 'node:path';

// Static files copied verbatim into dist/.
// `version.json` is web-only: it drives the OTA update check.
const PWA_STATIC_FILES_COMMON = [
  'manifest.json',
  'sw.js',
  'offline.html',
  'privacy.html',
];
const PWA_STATIC_FILES_WEB_ONLY = ['version.json'];

// Classic (non-module) scripts, minified individually and copied to dist/.
// Order does not matter here — index.html controls load order.
// `js/update-checker.js` is web-only, for the same reason as version.json.
const CLASSIC_JS_FILES_COMMON = [
  'js/supabase-config.js',
  'js/auth.js',
  'js/vendor/capacitor.js',
  'js/app.js',
  'js/mushaf.js',
];
const CLASSIC_JS_FILES_WEB_ONLY = ['js/update-checker.js'];

// Directories copied recursively into dist/.
// `fonts` carries the QCF per-page mushaf fonts; without it js/mushaf.js falls
// back to the jsDelivr CDN on every page turn and there is no offline mushaf.
const COPY_DIRS = ['icons', 'fonts'];

const SOURCE_CSS_FILE = 'css/style.css';

// Marks the OTA block in index.html. Sentinels rather than a regex over the
// <script> tags so the block survives reformatting and edits inside it.
const WEB_ONLY_BLOCK = /<!--\s*BUILD:WEB-ONLY-START[\s\S]*?BUILD:WEB-ONLY-END\s*-->/g;

async function minifyJavaScript(sourceFile, outputFile) {
  const source = await readFile(sourceFile, 'utf8');
  const result = await transform(source, {
    loader: 'js',
    target: 'es2018',
    minify: true,
    legalComments: 'none',
    charset: 'utf8',
  });
  await mkdir(dirname(outputFile), { recursive: true });
  await writeFile(outputFile, result.code, 'utf8');
}

async function minifyCss(sourceFile, outputFile) {
  const source = await readFile(sourceFile, 'utf8');
  const result = await transform(source, {
    loader: 'css',
    minify: true,
    legalComments: 'none',
    charset: 'utf8',
  });
  await mkdir(dirname(outputFile), { recursive: true });
  await writeFile(outputFile, result.code, 'utf8');
}

/**
 * Fails the build if any relative src=/href= in an emitted HTML file does not
 * resolve to a real file in dist/.
 *
 * This is the guard that would have caught js/mushaf.js (the mushaf reader was
 * referenced by index.html but never copied, so the flagship feature was absent
 * from every APK) and privacy.html (linked in-app, 404 inside the APK).
 */
async function assertHtmlReferencesResolve(distDir, htmlFiles) {
  const missing = [];
  for (const htmlFile of htmlFiles) {
    const fullPath = join(distDir, htmlFile);
    if (!existsSync(fullPath)) continue;
    const html = await readFile(fullPath, 'utf8');
    const refs = [...html.matchAll(/(?:src|href)\s*=\s*["']([^"']+)["']/g)].map((m) => m[1]);
    for (const ref of refs) {
      // Skip absolute URLs, protocol-relative URLs, anchors and data URIs.
      if (/^(?:[a-z]+:|\/\/|#|data:|mailto:)/i.test(ref)) continue;
      const clean = ref.split(/[?#]/)[0].replace(/^\.\//, '');
      if (!clean) continue;
      if (!existsSync(join(distDir, clean))) {
        missing.push(`${htmlFile} → ${ref}`);
      }
    }
  }
  if (missing.length) {
    throw new Error(
      `[quran-build] ${missing.length} referenced asset(s) missing from dist/:\n  ` +
        missing.join('\n  ')
    );
  }
}

/**
 * Fails the build if any entry in the service worker's STATIC_ASSETS is not in
 * dist/. sw.js feeds that list to cache.addAll() on install and deletes the
 * cache and rethrows if a single file fails — so one missing path silently
 * costs the app ALL offline support.
 */
async function assertServiceWorkerPrecacheResolves(distDir) {
  const swPath = join(distDir, 'sw.js');
  if (!existsSync(swPath)) return;
  const sw = await readFile(swPath, 'utf8');
  const block = sw.match(/STATIC_ASSETS\s*=\s*\[([\s\S]*?)\]/);
  if (!block) {
    throw new Error('[quran-build] could not find STATIC_ASSETS in dist/sw.js');
  }
  const entries = [...block[1].matchAll(/['"]([^'"]*)['"]/g)].map((m) => m[1]);
  const missing = entries.filter((entry) => {
    if (!entry) return false; // '' is the app root, served by index.html
    return !existsSync(join(distDir, entry));
  });
  if (missing.length) {
    throw new Error(
      `[quran-build] service worker precaches ${missing.length} file(s) absent from dist/ ` +
        `(this would disable offline support entirely):\n  ` +
        missing.join('\n  ')
    );
  }
}

function copyPwaStaticPlugin(mode) {
  const isAndroid = mode === 'android';
  const pwaStaticFiles = isAndroid
    ? PWA_STATIC_FILES_COMMON
    : [...PWA_STATIC_FILES_COMMON, ...PWA_STATIC_FILES_WEB_ONLY];
  const classicJsFiles = isAndroid
    ? CLASSIC_JS_FILES_COMMON
    : [...CLASSIC_JS_FILES_COMMON, ...CLASSIC_JS_FILES_WEB_ONLY];

  return {
    name: 'copy-and-minify-quran-assets',
    apply: 'build',
    async closeBundle() {
      const distDir = 'dist';
      await mkdir(distDir, { recursive: true });

      for (const file of pwaStaticFiles) {
        if (existsSync(file)) {
          await mkdir(dirname(join(distDir, file)), { recursive: true });
          await copyFile(file, join(distDir, file));
        }
      }

      for (const dir of COPY_DIRS) {
        if (existsSync(dir)) {
          await cp(dir, join(distDir, dir), {
            recursive: true,
            // icon.svg.bak is a stale duplicate; never ship it.
            filter: (src) => !src.endsWith('.bak'),
          });
        }
      }

      for (const file of classicJsFiles) {
        if (existsSync(file)) {
          await minifyJavaScript(file, join(distDir, file));
        }
      }

      if (existsSync(SOURCE_CSS_FILE)) {
        await minifyCss(SOURCE_CSS_FILE, join(distDir, SOURCE_CSS_FILE));
      }

      // Vite hashes HTML-linked assets by default. Restore the stable paths
      // expected by the service worker and the relative classic script tags.
      const indexPath = join(distDir, 'index.html');
      let indexHtml = await readFile(indexPath, 'utf8');
      indexHtml = indexHtml
        .replace(/\.\/assets\/manifest-[^"']+\.json/g, 'manifest.json')
        .replace(/\.\/assets\/icon-192x192-[^"']+\.png/g, 'icons/icon-192x192.png')
        .replace(/\.\/assets\/icon-96x96-[^"']+\.png/g, 'icons/icon-96x96.png')
        .replace(/\.\/assets\/index-[^"']+\.css/g, 'css/style.css')
        .replace(/\.\/assets\/app-[^"']+\.js/g, 'js/app.js');

      if (isAndroid) {
        indexHtml = indexHtml.replace(WEB_ONLY_BLOCK, '');
      }
      await writeFile(indexPath, indexHtml, 'utf8');

      // The hashed copies under dist/assets/ duplicate the stable-path files
      // that were just written; shipping both wastes ~145 KB inside the APK.
      if (/\.\/assets\//.test(indexHtml)) {
        throw new Error('[quran-build] dist/index.html still references ./assets/ after path rewrite');
      }
      await rm(join(distDir, 'assets'), { recursive: true, force: true });

      await assertHtmlReferencesResolve(distDir, ['index.html', 'privacy.html', 'offline.html']);
      await assertServiceWorkerPrecacheResolves(distDir);

      if (isAndroid) {
        // Scan code only: comments legitimately explain *why* the OTA updater
        // is absent, and matching those would be a false positive.
        const stripComments = (text) =>
          text
            .replace(/<!--[\s\S]*?-->/g, '')
            .replace(/\/\*[\s\S]*?\*\//g, '')
            .replace(/^[ \t]*\/\/.*$/gm, '');
        const forbidden = /apkUrl|vercel\.app\/apks|update-checker|RASHID_APP/;
        for (const file of ['index.html', 'sw.js']) {
          const full = join(distDir, file);
          if (existsSync(full) && forbidden.test(stripComments(await readFile(full, 'utf8')))) {
            throw new Error(`[quran-build] android build still contains OTA/sideload references in ${file}`);
          }
        }
      }

      console.log(
        `[quran-build] mode=${mode} · ${pwaStaticFiles.length} static assets, ` +
          `${classicJsFiles.length} minified scripts, dirs: ${COPY_DIRS.join(', ')} · guards passed`
      );
    },
  };
}

export default defineConfig(({ mode }) => ({
  base: './',

  build: {
    outDir: 'dist',
    emptyOutDir: true,
    target: 'es2018',
    minify: 'esbuild',
    cssMinify: true,
    sourcemap: false,
    rollupOptions: {
      input: 'index.html',
      output: {
        entryFileNames: 'js/[name].js',
        chunkFileNames: 'js/[name]-[hash].js',
        assetFileNames: 'assets/[name]-[hash][extname]',
      },
    },
  },

  // The app intentionally uses classic scripts for shared globals and load order.
  // They are minified and copied by copyPwaStaticPlugin instead of bundled by Vite.
  publicDir: false,
  optimizeDeps: {
    exclude: ['js/vendor/capacitor.js'],
  },
  server: {
    port: 5173,
    strictPort: false,
    open: false,
  },
  plugins: [copyPwaStaticPlugin(mode)],
}));
