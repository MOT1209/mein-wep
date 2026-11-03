import fs from 'node:fs';
import path from 'node:path';

/**
 * Release manifest, read at build time from the file the APK release bot
 * already maintains (`apks/updates.json`).
 *
 * The homepage opens with this data, so the front page can never drift from
 * what actually shipped — the previous hand-written "Latest Updates" block
 * was four months stale because nothing forced it to stay current.
 *
 * Each entry keeps its note in the language it was written in; the template
 * renders notes with dir="auto" so mixed Arabic/English stays legible.
 */
const SOURCE = path.join(process.cwd(), 'apks', 'updates.json');

const PAGE_LINKS = {
  'com.rashid.kingcraft': 'games/kingcraft-game/',
  'com.rashid.rustsurvival': 'games/rust-game/',
  'com.rashid.farmempire': 'games/farm-game/',
  'com.rashid.quranpro': 'quran.html',
  'com.rashid.smartvault': 'apps/calculator-app/',
  'com.rashid.quizmaster': 'apps/quiz-app/',
};

export default function () {
  const raw = JSON.parse(fs.readFileSync(SOURCE, 'utf8'));
  // Releases of hidden catalogue projects are not counted or shown.
  const catalog = JSON.parse(fs.readFileSync(path.join(process.cwd(), '_data', 'studioCatalog.json'), 'utf8')).projects;
  const hidden = new Set(catalog.filter((p) => p.hidden && p.apkId).map((p) => p.apkId));

  const items = Object.entries(raw.apps ?? {}).filter(([id]) => !hidden.has(id)).map(([id, app]) => ({
    id,
    name: app.name,
    version: app.version,
    date: app.date,
    note: (app.notes ?? [])[0] ?? '',
    href: PAGE_LINKS[id] ?? 'downloads.html',
  }));

  // Newest first; ties broken by name so the order is stable between builds.
  items.sort((a, b) => (a.date === b.date ? a.name.localeCompare(b.name) : b.date.localeCompare(a.date)));

  // The newest shown release, not the manifest's own date, which may belong to a hidden one.
  return { updatedAt: items[0]?.date ?? raw.updatedAt, items };
}
