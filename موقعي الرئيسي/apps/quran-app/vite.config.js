// ==================== Quran Pro - Vite Build Configuration ====================
// يبني نسخة إنتاج مضغوطة مع الحفاظ على السكربتات الكلاسيكية والـ globals.

import { defineConfig } from 'vite';
import { transform } from 'esbuild';
import {
  copyFile,
  cp,
  mkdir,
  readFile,
  writeFile,
} from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { dirname, join } from 'node:path';

const PWA_STATIC_FILES = [
  'manifest.json',
  'sw.js',
  'offline.html',
  'version.json',
];

const CLASSIC_JS_FILES = [
  'js/supabase-config.js',
  'js/auth.js',
  'js/vendor/capacitor.js',
  'js/app.js',
  'js/update-checker.js',
];

const SOURCE_CSS_FILE = 'css/style.css';

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

function copyPwaStaticPlugin() {
  return {
    name: 'copy-and-minify-quran-assets',
    apply: 'build',
    async closeBundle() {
      const distDir = 'dist';
      await mkdir(distDir, { recursive: true });

      for (const file of PWA_STATIC_FILES) {
        if (existsSync(file)) {
          await copyFile(file, join(distDir, file));
        }
      }

      if (existsSync('icons')) {
        await cp('icons', join(distDir, 'icons'), { recursive: true });
      }

      for (const file of CLASSIC_JS_FILES) {
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
      await writeFile(indexPath, indexHtml, 'utf8');

      console.log(
        `[quran-build] copied ${PWA_STATIC_FILES.length} PWA assets, ` +
        `${CLASSIC_JS_FILES.length} minified classic scripts, and minified css/style.css`
      );
    },
  };
}

export default defineConfig(() => ({
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
  plugins: [copyPwaStaticPlugin()],
}));
