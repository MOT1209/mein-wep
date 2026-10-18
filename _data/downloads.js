import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';

/**
 * Download cards for downloads.html, built from the release manifest the APK
 * bot maintains (apks/updates.json).
 *
 * The SHA-256 shown to users is computed from the actual file at build time,
 * so it can never drift from what is served. A manifest entry whose APK file
 * is missing fails the build instead of rendering a dead download button.
 * Descriptions and the King Studio detail link come from
 * _data/studioCatalog.json (matched by apkId).
 */
const ROOT = process.cwd();

export default function () {
  const manifest = JSON.parse(fs.readFileSync(path.join(ROOT, 'apks', 'updates.json'), 'utf8'));
  const catalog = JSON.parse(fs.readFileSync(path.join(ROOT, '_data', 'studioCatalog.json'), 'utf8')).projects;
  const byApk = Object.fromEntries(catalog.filter((p) => p.apkId).map((p) => [p.apkId, p]));

  const items = Object.entries(manifest.apps ?? {}).map(([id, app]) => {
    const file = app.url.replace(/^\//, '');
    const abs = path.join(ROOT, file);
    if (!fs.existsSync(abs)) throw new Error(`[downloads] ${id}: APK missing: ${file}`);
    const sha256 = crypto.createHash('sha256').update(fs.readFileSync(abs)).digest('hex');
    const project = byApk[id];
    return {
      id,
      name: app.name,
      version: app.version,
      date: app.date,
      file,
      sizeMb: (fs.statSync(abs).size / 1048576).toFixed(1),
      sha256,
      type: project?.type === 'Game' ? 'Game' : 'App',
      description: project?.description ?? '',
      detailUrl: project ? `king-studio/${project.section}/${project.id}/` : null,
      launchUrl: project?.launchUrl ?? null,
    };
  });

  // Games first, then apps; alphabetical within each, so the order is stable.
  items.sort((a, b) => (a.type === b.type ? a.name.localeCompare(b.name) : a.type === 'Game' ? -1 : 1));
  return { updatedAt: manifest.updatedAt, items };
}
