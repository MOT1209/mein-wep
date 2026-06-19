/**
 * gen-icons.mjs — Generate native Android launcher icons for a Capacitor project.
 *
 * Usage: node scripts/gen-icons.mjs <project-dir>
 *        node scripts/gen-icons.mjs apps/quran-app
 *
 * Picks the best available source icon from the project's icons/ folder
 * (prefers icon.svg, then the largest PNG) and writes:
 *   - ic_launcher.png          (legacy square, all densities)
 *   - ic_launcher_round.png    (legacy round, all densities)
 *   - ic_launcher_foreground.png (adaptive foreground, all densities)
 * into android/app/src/main/res/mipmap-* so the installed app shows a
 * proper icon instead of the Capacitor default.
 *
 * Fails soft: if sharp is missing or no source icon exists, it logs and
 * exits 0 so it never breaks the CI build.
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');

// Legacy launcher icon sizes (px) per density bucket.
const LAUNCHER = { mdpi: 48, hdpi: 72, xhdpi: 96, xxhdpi: 144, xxxhdpi: 192 };
// Adaptive-icon foreground sizes (px) per density bucket (108dp canvas).
const FOREGROUND = { mdpi: 108, hdpi: 162, xhdpi: 216, xxhdpi: 324, xxxhdpi: 432 };

// Candidate source icons, most preferred first.
const CANDIDATES = [
  'icons/icon.svg',
  'icons/icon-512x512.png',
  'icons/icon-512.png',
  'icons/icon-384x384.png',
  'icons/icon-192x192.png',
  'icons/icon-192.png',
];

async function main() {
  const arg = process.argv[2];
  if (!arg) {
    console.error('Usage: node scripts/gen-icons.mjs <project-dir>');
    process.exit(1);
  }

  const projectDir = path.resolve(ROOT, arg);
  const resDir = path.join(projectDir, 'android', 'app', 'src', 'main', 'res');
  if (!fs.existsSync(resDir)) {
    console.log(`⏭️  No android res dir yet (run "cap add android" first): ${resDir}`);
    process.exit(0);
  }

  let sharp;
  try {
    sharp = (await import('sharp')).default;
  } catch {
    console.log('⏭️  sharp not installed — skipping icon generation');
    process.exit(0);
  }

  const src = CANDIDATES
    .map((f) => path.join(projectDir, f))
    .find((f) => fs.existsSync(f));
  if (!src) {
    console.log('⏭️  No source icon found in icons/ — skipping');
    process.exit(0);
  }
  console.log(`🎨 Source icon: ${path.relative(projectDir, src)}`);

  const isSvg = src.toLowerCase().endsWith('.svg');
  // For SVG, render at high density so downscaling stays crisp.
  const loadSquare = (size) =>
    sharp(src, isSvg ? { density: Math.max(512, size * 4) } : undefined)
      .resize(size, size, { fit: 'cover' });

  for (const [density, size] of Object.entries(LAUNCHER)) {
    const dir = path.join(resDir, `mipmap-${density}`);
    fs.mkdirSync(dir, { recursive: true });

    const square = await loadSquare(size).png().toBuffer();
    fs.writeFileSync(path.join(dir, 'ic_launcher.png'), square);

    // Round variant: apply a circular alpha mask to the square icon.
    const r = size / 2;
    const circle = Buffer.from(
      `<svg width="${size}" height="${size}"><circle cx="${r}" cy="${r}" r="${r}" fill="#fff"/></svg>`
    );
    const round = await sharp(square)
      .composite([{ input: circle, blend: 'dest-in' }])
      .png()
      .toBuffer();
    fs.writeFileSync(path.join(dir, 'ic_launcher_round.png'), round);
  }

  for (const [density, size] of Object.entries(FOREGROUND)) {
    const dir = path.join(resDir, `mipmap-${density}`);
    fs.mkdirSync(dir, { recursive: true });

    // Adaptive foreground: keep the icon within the ~66% safe zone, the
    // rest transparent (the system applies its own mask/background).
    const inner = Math.round(size * 0.66);
    const icon = await loadSquare(inner).png().toBuffer();
    const pad = Math.round((size - inner) / 2);
    const foreground = await sharp({
      create: { width: size, height: size, channels: 4, background: { r: 0, g: 0, b: 0, alpha: 0 } },
    })
      .composite([{ input: icon, top: pad, left: pad }])
      .png()
      .toBuffer();
    fs.writeFileSync(path.join(dir, 'ic_launcher_foreground.png'), foreground);
  }

  console.log(`✅ Launcher icons generated for ${arg}`);
}

main().catch((err) => {
  console.error('⚠️  Icon generation failed (continuing build):', err.message);
  process.exit(0);
});
