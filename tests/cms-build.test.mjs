// The build with CMS content: scripts/fetch-cms.mjs against a fake Supabase,
// and a full Eleventy build from a CMS fixture into a temporary folder (the
// real dist/ and .cms-cache/ are not touched).
import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { execFileSync, spawnSync } from 'node:child_process';
import { fetchCms } from '../scripts/fetch-cms.mjs';
import { mapDbProject } from '../scripts/cms/source.mjs';

const TMP = fs.mkdtempSync(path.join(os.tmpdir(), 'cms-build-'));
const CACHE = path.join(TMP, 'cms.json');
const OUT = path.join(TMP, 'dist');

const row = (over = {}) => ({
  slug: 'king-agent', section: 'labs', title: 'King Agent', short_description: 'An agent.',
  description: 'First paragraph.\n\nSecond <script>alert(1)</script> paragraph.',
  project_type: 'AI', platforms: ['Web'], technologies: ['TypeScript'], features: ['Plans', 'Acts'],
  status: 'Experimental', featured: true, visibility: 'public', sort_order: 5,
  cover_image: 'https://kcltollasghlvuoxvjqa.supabase.co/storage/v1/object/public/media/agent.webp',
  image_alt: 'King Agent logo', launch_url: null, demo_url: 'https://king-agent.example/demo',
  download_url: null, apk_id: null,
  i18n: { ar: { description: 'وكيل.' } },
  category: { slug: 'ai-agents', name: 'AI Agents', name_de: 'KI-Agenten', name_ar: 'وكلاء الذكاء الاصطناعي' },
  repo: { full_name: 'MOT1209/KingAgent', html_url: 'https://github.com/MOT1209/KingAgent', language: 'TypeScript', is_archived: false, description: 'From GitHub' },
  images: [{ url: 'https://kcltollasghlvuoxvjqa.supabase.co/storage/v1/object/public/media/s1.webp', alt: 'Screenshot one', sort_order: 1 }],
  ...over,
});

function writeFixture(studio) {
  fs.writeFileSync(CACHE, JSON.stringify({ fetchedAt: new Date().toISOString(), studio, categories: [], nav: [], settings: {}, pages: [], blog: [] }));
}

function build() {
  return spawnSync(process.execPath, ['node_modules/@11ty/eleventy/cmd.cjs', '--config=eleventy.config.mjs', `--output=${OUT}`, '--quiet'], {
    env: { ...process.env, CMS_CACHE_FILE: CACHE },
    encoding: 'utf8',
  });
}

before(() => {
  // A calculator-vault row stays public, quiz-master is absent (hidden in the CMS).
  writeFixture([
    row(),
    row({ slug: 'calculator-vault', section: 'apps', title: 'Calculator Vault', description: null, project_type: 'App', cover_image: 'apps/calculator-app/icons/icon.svg', image_alt: 'Calculator Vault app icon', launch_url: 'apps/calculator-app/', demo_url: null, apk_id: 'com.rashid.smartvault', repo: null, images: [], category: null, i18n: {} }),
  ]);
  const r = build();
  assert.equal(r.status, 0, r.stderr || r.stdout);
});
after(() => fs.rmSync(TMP, { recursive: true, force: true }));

const page = (p) => fs.readFileSync(path.join(OUT, p), 'utf8');

test('a CMS project gets its pages in all three languages', () => {
  for (const pre of ['', 'de/', 'ar/']) assert.ok(fs.existsSync(path.join(OUT, `${pre}king-studio/labs/king-agent/index.html`)), pre);
});

test('external image, demo, GitHub link, language and gallery render; text is escaped', () => {
  const html = page('king-studio/labs/king-agent/index.html');
  assert.match(html, /src="https:\/\/kcltollasghlvuoxvjqa\.supabase\.co\/storage\/v1\/object\/public\/media\/agent\.webp"/);
  assert.match(html, /href="https:\/\/king-agent\.example\/demo"/);
  assert.match(html, /href="https:\/\/github\.com\/MOT1209\/KingAgent"/);
  assert.match(html, /TypeScript/);
  assert.match(html, /alt="Screenshot one"/);
  assert.match(html, /<p>First paragraph\.<\/p>/);
  assert.ok(!html.includes('<script>alert(1)</script>'), 'database text must be escaped');
  assert.match(html, /&lt;script&gt;alert\(1\)&lt;\/script&gt;/);
});

test('category names come from the category table per language', () => {
  assert.match(page('de/king-studio/labs/king-agent/index.html'), /KI-Agenten/);
  assert.match(page('ar/king-studio/labs/king-agent/index.html'), /وكلاء الذكاء الاصطناعي/);
  assert.match(page('ar/king-studio/labs/king-agent/index.html'), /وكيل\./);
});

test('a project that is not public in the CMS has no page, card or download listing', () => {
  assert.ok(!fs.existsSync(path.join(OUT, 'king-studio/apps/quiz-master/index.html')));
  assert.ok(!page('king-studio/apps/index.html').includes('quiz-master'));
  assert.ok(!page('downloads.html').includes('Quiz Master'));
  assert.ok(page('downloads.html').includes('Calculator Vault'));
});

test('the URL gate sees the same pages as the build', () => {
  const out = execFileSync(process.execPath, ['--input-type=module', '-e',
    "import('./scripts/site-templates.mjs').then(m => console.log(JSON.stringify(m.TEMPLATE_OUTPUTS['king-studio/project.njk'])))"],
  { env: { ...process.env, CMS_CACHE_FILE: CACHE }, encoding: 'utf8' });
  assert.deepEqual(JSON.parse(out).sort(), ['king-studio/apps/calculator-vault/index.html', 'king-studio/labs/king-agent/index.html']);
});

test('the build fails on an unsafe CMS link instead of publishing it', () => {
  writeFixture([row({ demo_url: 'javascript:alert(1)' })]);
  const r = build();
  assert.notEqual(r.status, 0);
  assert.match(r.stderr + r.stdout, /demoUrl must be an https:\/\/ link/);
});

test('mapDbProject falls back to the GitHub description and drops empty translations', () => {
  const p = mapDbProject(row({ short_description: '', i18n: {}, category: { slug: 'x', name: 'X', name_de: null, name_ar: null } }));
  assert.equal(p.description, 'From GitHub');
  assert.deepEqual(p.i18n, {});
});

test('fetchCms asks only for public, published rows and maps settings', async () => {
  const seen = [];
  const realFetch = globalThis.fetch;
  globalThis.fetch = async (url) => {
    seen.push(decodeURIComponent(String(url)));
    const u = new URL(url);
    const body = u.pathname.endsWith('website_settings') ? [{ key: 'site.name', value: { value: 'R' } }] : [];
    return new Response(JSON.stringify(body), { status: 200 });
  };
  try {
    const data = await fetchCms({ url: 'https://x.supabase.co', key: 'anon', now: new Date('2026-11-03T00:00:00Z') });
    assert.deepEqual(data.settings, { 'site.name': { value: 'R' } });
  } finally {
    globalThis.fetch = realFetch;
  }
  const studio = seen.find((u) => u.includes('/studio_projects'));
  assert.match(studio, /visibility=eq\.public/);
  assert.match(studio, /deleted_at=is\.null/);
  const blog = seen.find((u) => u.includes('/blog_posts'));
  assert.match(blog, /status=eq\.published/);
  assert.match(blog, /published_at=lte\.2026-11-03T00:00:00\.000Z/);
  assert.match(seen.find((u) => u.includes('/navigation_items')), /visible=eq\.true/);
  assert.match(seen.find((u) => u.includes('/website_settings')), /is_public=eq\.true/);
});
