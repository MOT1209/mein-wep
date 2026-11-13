# Performance Audit (Phase 01)

All numbers were **measured locally** in this session: the `dist/` build, served by a plain static Node server, loaded in headless Chromium (Playwright) at 375 px. **The live site could not be measured** because the network policy blocked `rashid-wep.vercel.app`. That means there are no real-network timings, no compression or CDN effects, and no Lighthouse or Core Web Vitals scores. Third-party hosts (Google Fonts, Font Awesome, AdSense, GTM) were partly blocked, so their cost is not included, and icons and fonts in screenshots are not representative.

## Build

| Step | Measured |
|---|---|
| `npm ci` | 2.5 s |
| `npm run build` (CMS fetch, CSS minify, Eleventy) | 1.7 s wall; Eleventy reported 43 pages written and 374 files copied in 0.66 s |
| `npm test` | 16.5 s (130 tests) |
| `dist/` size | **45 MB**: `apks` 31 MB, `audio` 7 MB, `games` 3.3 MB, `apps` 608 KB, `js` 388 KB, `icons` 388 KB, `css` 308 KB |

The build is fast. Nearly all of the output is binary assets.

## Page weight (uncompressed first-party bytes per page load, KB)

| Page | JS | CSS | Images | HTML | Third-party hosts requested |
|---|---|---|---|---|---|
| `/` | 11 | 41 | 24 | 21 | fonts.googleapis/gstatic, cdnjs, googletagmanager |
| `/ar/` | 11 | 41 | 24 | 23 | same |
| `/king-studio/` | 6 | 32 | 1 | 12 | fonts, cdnjs |
| `/king-studio/labs/` | 6 | 32 | 0 | 8 | fonts, cdnjs |
| `/downloads.html` | 6 | 28 | 0 | 14 | fonts |
| `/blog/` | 3 | 32 | 0 | 15 | fonts, cdnjs |
| `/about.html` | 3 | 21 | 23 | 12 | fonts, cdnjs |
| `/learning.html` | **221** | 21 | 0 | 9 | fonts, cdnjs, **AdSense**, Supabase |
| `/vault/docs/` | 0 | **107** | 0 | 7 | cdnjs, **AdSense** |
| `/devos.html` | 2 | **118** | 62 | 15 | fonts, cdnjs |
| `/models/Rashid-Model/` | 45 | 0 | 0 | **70** (inline) | fonts, **AdSense**, cdnjs, **jsDelivr (unpinned)**, js.puter.com |
| `/admin/login.html` | 9 | 9 | 0 | 3 | none |

Other checks, at both 375 px and 1280 px on the pages above:
- `document.scrollWidth` equals the viewport, so **no horizontal overflow**.
- Exactly **one `h1`** per page.
- **0 images without `alt`**.

## Bottlenecks [FACT]

1. **`/learning.html` loads the full vendored Supabase client (218 KB, `js/vendor/supabase-2.117.2.js`)** to read a few rows. That is about 20 times the JS of the homepage.
2. **Legacy CSS:** `vault/docs/` and `devos.html` link the **unminified** `css/style.css` (107 KB; `?v=4.2` / `?v=10.2`), even though `style.min.css` exists. `devos.html` loads 118 KB of CSS in total. Migrated pages use about 21–41 KB.
3. **`models/Rashid-Model/index.html`** puts about 70 KB inline and loads unpinned CDN libraries (Chart.js, supabase-js@2) plus AdSense.
4. **Font Awesome from cdnjs** on most pages. The full icon stylesheet is about 100 KB or more compressed, plus webfonts **[ASSUMPTION; not measured, blocked]**.
5. **Caching:** `vercel.json` sends `Cache-Control: public, max-age=0, must-revalidate` for **all CSS and JS**. Every visit revalidates. That is cheap with ETags but still costs a round trip per file. Assets are not fingerprinted, which is why long caching is not possible yet. Images and audio get 7 days.
6. **Repository and deploy size:** a 112 MiB git pack and 45 MB per deploy upload, almost all APKs and audio. A GitHub Release (`apks-latest`) already exists for APKs (`docs/APK_HOSTING.md`).

## Not measured

- Real LCP, CLS and INP on the live site, and the effect of Vercel's compression.
- The games and apps runtime performance (WebGL and Three.js games). These are out of scope for a site audit and need device testing.
- Database query latency (no access).

## Recommendations

| # | Change | Expected gain |
|---|---|---|
| P-1 | Fingerprint CSS and JS at build time (hash in the filename), then `max-age=31536000, immutable` | no revalidation round trips on repeat visits |
| P-2 | Replace the Supabase client on `/learning.html` with a single `fetch` to PostgREST (or render the lessons at build time from the CMS cache) | about −215 KB JS on that page |
| P-3 | Migrate `vault/*`, `devos.html` and `learning.html` to `tokens.css` and `site.css`, then retire `style.css` | about −80 KB CSS per legacy page |
| P-4 | Replace Font Awesome with an inline SVG sprite of the icons actually used | removes a third-party render-blocking stylesheet and its fonts |
| P-5 | Serve APKs from GitHub Releases only, and move Quran audio to a CDN or a Release | deploy size −38 MB; git growth stops |
| P-6 | Run Lighthouse against the live site from an environment that can reach it, and record a baseline | real numbers for Phase 02 acceptance criteria |
