// The build with CMS content: scripts/fetch-cms.mjs against a fake Supabase,
// and a full Eleventy build from a CMS fixture into a temporary folder (the
// real dist/ and .cms-cache/ are not touched).
import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { execFileSync, spawnSync } from 'node:child_process';
import { fetchCms, run as runFetch } from '../scripts/fetch-cms.mjs';
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

const CONTENT = {
  nav: [
    { nav_key: 'home', label: 'Start here', label_de: null, label_ar: 'ابدأ', href: '' },
    { nav_key: 'studio', label: 'King Studio', label_de: null, label_ar: null, href: 'king-studio/' },
    { nav_key: 'evil', label: 'Evil', href: 'javascript:alert(1)' },
    { nav_key: 'gh', label: 'Code', href: 'https://github.com/MOT1209' },
  ],
  settings: {
    'site.name': { value: 'Rashid Ali' },
    'contact.email': { value: 'hello@example.com' },
    'social.links': { value: [{ label: 'LinkedIn', url: 'https://linkedin.com/in/x' }, { label: 'Bad', url: 'javascript:alert(1)' }] },
  },
  pages: [
    { page_key: 'home', locale: 'en', content: { headline: 'CMS <b>headline</b>', ctaWork: 'Hire me' } },
    { page_key: 'home', locale: 'ar', content: { headline: 'عنوان من لوحة التحكم' } },
    { page_key: 'footer', locale: 'en', content: { text: 'Made by Rashid' } },
    { page_key: 'about', locale: 'en', content: { who: 'I build <things>.', subtitle: 'Maker' } },
    { page_key: 'contact', locale: 'ar', content: { subtitle: 'راسلني الآن' } },
  ],
  blog: [{
    slug: 'hello-cms', locale: 'en', title: 'Hello <script>alert(1)</script>', description: 'First CMS post',
    body_md: '# Heading\n\nSome **bold** text.\n\n<script>alert(2)</script>\n\n[click](javascript:alert(3)) and [ok](https://example.com)',
    cover_image: null, cover_alt: null, categories: ['News'], tags: ['cms'], published_at: '2026-11-01T10:00:00.000Z', updated_at: '2026-11-01T10:00:00.000Z',
  }, {
    slug: 'flutter-clean-architecture', locale: 'en', title: 'Clash', description: '', body_md: 'x', categories: [], tags: [], published_at: '2026-11-01T10:00:00.000Z',
  }],
};

function writeFixture(studio, content = CONTENT) {
  fs.writeFileSync(CACHE, JSON.stringify({ fetchedAt: new Date().toISOString(), studio, categories: [], ...content }));
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
    "import('./scripts/site-templates.mjs').then(m => console.log(JSON.stringify([m.TEMPLATE_OUTPUTS['king-studio/project.njk'], m.TEMPLATE_OUTPUTS['blog/cms-post.njk']])))"],
  { env: { ...process.env, CMS_CACHE_FILE: CACHE }, encoding: 'utf8' });
  const [studio, blog] = JSON.parse(out);
  assert.deepEqual(studio.sort(), ['king-studio/apps/calculator-vault/index.html', 'king-studio/labs/king-agent/index.html']);
  assert.deepEqual(blog, ['blog/hello-cms.html']);
});

test('the build fails on an unsafe CMS link instead of publishing it', () => {
  writeFixture([row({ demo_url: 'javascript:alert(1)' })]);
  const r = build();
  assert.notEqual(r.status, 0);
  assert.match(r.stderr + r.stdout, /demoUrl must be an https:\/\/ link/);
});

test('menu, brand, home texts and footer come from the CMS; unsafe links are dropped', () => {
  const home = page('index.html');
  assert.match(home, />Start here</);
  assert.match(home, /href="https:\/\/github\.com\/MOT1209">Code</);
  assert.ok(!home.includes('javascript:'), 'no javascript: link anywhere');
  assert.match(home, />Rashid Ali<span class="dot">/);
  assert.match(home, /CMS &lt;b&gt;headline&lt;\/b&gt;/);
  assert.match(home, />Hire me</);
  assert.match(home, /Made by Rashid/);
  assert.match(home, /href="https:\/\/linkedin\.com\/in\/x"/);
  assert.match(home, /mailto:hello@example\.com/);
  assert.match(page('ar/index.html'), /عنوان من لوحة التحكم/);
  assert.match(page('ar/index.html'), />ابدأ</);
  // German has no CMS headline: the built-in text stays.
  assert.ok(!page('de/index.html').includes('CMS &lt;b&gt;'));
});

test('About and Contact texts come from the CMS per language, escaped, with fallbacks', () => {
  const about = page('about.html');
  assert.match(about, /<p>I build &lt;things&gt;\.<\/p>/);
  assert.match(about, /<p class="subtitle">Maker<\/p>/);
  assert.match(about, /Websites and web apps with <strong>HTML<\/strong>/, 'empty field keeps the built-in text');
  assert.match(page('ar/contact.html'), /<p class="subtitle">راسلني الآن<\/p>/);
  assert.ok(!page('de/about.html').includes('I build'));
});

test('a CMS blog post gets a page with escaped, sanitised Markdown', () => {
  const html = page('blog/hello-cms.html');
  assert.match(html, /<h1>Hello &lt;script&gt;alert\(1\)&lt;\/script&gt;<\/h1>/);
  assert.match(html, /<strong>bold<\/strong>/);
  assert.ok(!/<script>alert\(2\)/.test(html), 'raw HTML in Markdown is not rendered');
  assert.ok(!/href="javascript:/i.test(html), 'javascript: links are dropped');
  assert.match(html, /href="https:\/\/example\.com"/);
  const ld = html.match(/<script type="application\/ld\+json">([^<]*)<\/script>/g).join('');
  assert.ok(!ld.includes('</script><'), 'JSON-LD cannot be closed by post text');
  assert.match(ld, /\\u003cscript/);
});

test('CMS posts join the index list and the homepage; a file-post slug is never overwritten', () => {
  const list = JSON.parse(page('blog/cms-posts.json'));
  assert.deepEqual(list.map((p) => p.id), ['hello-cms']);
  assert.match(page('index.html'), /blog\/hello-cms\.html/);
  assert.ok(!page('blog/flutter-clean-architecture.html').includes('Clash'));
});

test('the static RSS feed lists CMS posts, escaped, next to the file posts', () => {
  const rss = page('blog/rss.xml');
  assert.match(rss, /<link>https:\/\/rashid-wep\.vercel\.app\/blog\/hello-cms\.html<\/link>/);
  assert.match(rss, /<title>Hello &lt;script&gt;alert\(1\)&lt;\/script&gt;<\/title>/);
  assert.match(rss, /flutter-clean-architecture\.html/);
  assert.equal((rss.match(/flutter-clean-architecture\.html<\/link>/g) || []).length, 1, 'no duplicate for a clashing slug');
  assert.ok(!rss.includes('<title>Clash</title>'));
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

test('fetch-cms: missing tables fall back; a network failure stops production builds only', async () => {
  const realFetch = globalThis.fetch;
  const realLog = console.log;
  console.log = () => {};
  const base = { SUPABASE_URL: 'https://x.supabase.co', SUPABASE_ANON_KEY: 'anon' };
  try {
    globalThis.fetch = async () => new Response(JSON.stringify({ code: 'PGRST205', message: 'not found' }), { status: 404 });
    assert.equal(await runFetch({ ...base, VERCEL_ENV: 'production' }), 'git', 'before the migration production still builds');
    globalThis.fetch = async () => { throw new Error('ECONNRESET'); };
    await assert.rejects(runFetch({ ...base, VERCEL_ENV: 'production' }), /production build stopped/);
    assert.equal(await runFetch({ ...base, VERCEL_ENV: 'preview' }), 'git');
    assert.equal(await runFetch({ ...base, VERCEL_ENV: 'production', CMS_REQUIRED: '0' }), 'git');
    await assert.rejects(runFetch({ ...base, CMS_REQUIRED: '1' }), /CMS fetch failed/);
    assert.equal(await runFetch({}), 'git');
  } finally {
    globalThis.fetch = realFetch;
    console.log = realLog;
  }
});
