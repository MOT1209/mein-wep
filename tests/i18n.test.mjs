// Language versions of the core pages (site.translations, _data/i18n).
// The string files must stay in step, every language version must point at
// the others with hreflang, and pages served from /de/ must not carry links
// that only resolve from the site root. Needs `npm run build` first for the
// dist checks; the string checks always run.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, readFileSync, statSync } from 'node:fs';
import path from 'node:path';

const built = existsSync('dist/index.html');
const skip = !built && 'run npm run build first';

const site = JSON.parse(readFileSync('_data/site.json', 'utf8'));
const strings = Object.fromEntries(
  site.locales.map((l) => [l.code, JSON.parse(readFileSync(`_data/i18n/${l.code}.json`, 'utf8'))]),
);
// English may leave these empty: they only explain that content is English.
const OPTIONAL_IN_EN = new Set(['home.writingNote']);

function shape(value, prefix = '') {
  if (Array.isArray(value)) return [[prefix, `array:${value.length}`], ...value.flatMap((v, i) => shape(v, `${prefix}[${i}]`))];
  if (value && typeof value === 'object') return Object.entries(value).flatMap(([k, v]) => shape(v, prefix ? `${prefix}.${k}` : k));
  return [[prefix, typeof value]];
}

test('every locale has exactly the keys English has', () => {
  const en = new Map(shape(strings.en));
  for (const [code, data] of Object.entries(strings)) {
    assert.deepEqual(new Map(shape(data)), en, `${code}.json does not match en.json`);
  }
});

test('no translated string is empty', () => {
  const leaves = (v, p = '') => (v && typeof v === 'object'
    ? Object.entries(v).flatMap(([k, x]) => leaves(x, p ? `${p}.${k}` : k))
    : [[p, v]]);
  for (const [code, data] of Object.entries(strings)) {
    for (const [key, value] of leaves(data)) {
      if (code === 'en' && OPTIONAL_IN_EN.has(key)) continue;
      if (typeof value === 'string') assert.notEqual(value.trim(), '', `${code}: ${key} is empty`);
    }
  }
});

const outputFor = (p) => `dist/${p === '' || p.endsWith('/') ? `${p}index.html` : p}`;
const read = (p) => readFileSync(outputFor(p), 'utf8');

test('each language version declares its language and links the others', { skip }, () => {
  for (const [key, versions] of Object.entries(site.translations)) {
    for (const [code, p] of Object.entries(versions)) {
      const html = read(p);
      assert.match(html, new RegExp(`<html lang="${code}"`), `${key}/${code}: wrong lang`);
      for (const [other, otherPath] of Object.entries(versions)) {
        assert.ok(
          html.includes(`hreflang="${other}" href="${site.siteUrl}/${otherPath}"`),
          `${key}/${code}: missing hreflang ${other}`,
        );
        if (other !== code) {
          assert.match(html, new RegExp(`class="lang-switch"[^>]*hreflang="${other}"`), `${key}/${code}: no switcher to ${other}`);
        }
      }
      assert.ok(html.includes(`hreflang="x-default" href="${site.siteUrl}/${versions.en}"`), `${key}/${code}: x-default`);
    }
  }
});

test('translated pages are translated, set their direction and carry no ads', { skip }, () => {
  for (const { code } of site.locales.filter((l) => l.code !== 'en')) {
    const t = strings[code];
    for (const versions of Object.values(site.translations)) {
      const p = versions[code];
      if (p === undefined) continue;
      const html = read(p);
      assert.match(html, new RegExp(`<html lang="${code}" dir="${t.dir}"`), `${p}: lang/dir`);
      assert.ok(html.includes(`>${t.nav.about}</a>`), `${p}: navigation not translated`);
      assert.ok(html.includes(`>${t.header.skip}</a>`), `${p}: skip link not translated`);
      assert.doesNotMatch(html, /adsbygoogle|googlesyndication/, `${p}: ads`);
    }
  }
});

test('relative links on translated pages resolve to built files', { skip }, () => {
  const pages = Object.values(site.translations).flatMap((v) => Object.values(v));
  for (const p of pages) {
    const file = outputFor(p);
    const html = readFileSync(file, 'utf8');
    for (const [, url] of html.matchAll(/(?:href|src)="([^"]+)"/g)) {
      if (/^(?:[a-z]+:|\/\/|#|\{)/i.test(url)) continue;
      const clean = decodeURIComponent(url.split(/[?#]/)[0]);
      let target = path.normalize(path.join(path.dirname(file), clean));
      if (clean.endsWith('/') || (existsSync(target) && statSync(target).isDirectory())) {
        target = path.join(target, 'index.html');
      }
      assert.ok(existsSync(target), `${p}: ${url} does not resolve (${target})`);
    }
  }
});

// The owner's real profile: his name and photo on the homepage and About
// page in every language, and none of the skills he does not use.
test('homepage and About show Rashid Ali with his photo and real skills', { skip }, () => {
  assert.ok(existsSync('dist/images/rashid-ali.webp'), 'photo is served');
  for (const key of ['home', 'about']) {
    for (const p of Object.values(site.translations[key])) {
      const html = read(p);
      assert.match(html, /<img[^>]+images\/rashid-ali\.webp"[^>]+alt="[^"]+"/, `${p}: photo with alt`);
      assert.match(html, /<title>[^<]*(Rashid Ali|راشد علي)/, `${p}: title names Rashid Ali`);
      assert.doesNotMatch(html, /Next\.js|Three\.js|TypeScript/, `${p}: lists a skill he does not use`);
      assert.match(html, /Godot/, `${p}: Godot`);
    }
  }
});
