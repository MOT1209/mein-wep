# AGENTS.md

Instructions for any coding agent working in this repository (Claude Code, Codex, opencode, Copilot, and so on). Claude-specific workflow lives in `CLAUDE.md`; the visual rules live in `DESIGN.md`.

## What this repo is

Rashid's personal site, deployed to https://rashid-wep.vercel.app: a portfolio, the **King Studio** games and apps catalogue, a blog, a downloads page, a knowledge vault and a few standalone PWAs. It is a static site built with **Eleventy 3** on plain HTML, CSS and JavaScript (ES modules). There is no frontend framework. `api/*.js` are Vercel serverless functions.

## Commands

```bash
npm ci            # Node 20 or newer
npm start         # dev server with live reload
npm run build     # eleventy build to dist/
npm run verify    # URL-surface gate: dist/ must equal the tracked, servable files
npm test          # node:test suites; run `npm run build` first, the dist checks skip without it
```

Before saying a change is done, run `npm run build && npm run verify && npm test` and report the real results. If you changed UI, also look at it in a browser at about 375px and 1280px wide (Playwright is fine); passing tests do not prove a layout works.

## Rules that must not be broken

1. **Never run `git add .` or `git add -A`.** The repository root is the deploy root and holds other projects and untracked secret files. A blanket add once wiped the live site and published an API key. Stage by explicit path, run `git status`, and check `git ls-files -d` is empty (an unintended deletion shows up there).
2. **Only tracked files reach `dist/`.** The build copies files one by one from `git ls-files`. A new file does not appear in the build until it is `git add`-ed. Files that must never be served are listed in `eleventy.config.mjs` and mirrored in `scripts/check-url-surface.mjs`; keep both in step.
3. **Never commit secrets.** No API keys, tokens, keystores or `.env*`. Keys for `api/*` live in the Vercel project settings. Client code only ever holds publishable keys.
4. **Do not change published URLs by accident.** `npm run verify` fails if the served file set changes. A template that renders to a fixed `.html` URL needs an explicit `permalink` *and* an entry in `scripts/site-templates.mjs`. Moving a page needs a redirect in `vercel.json`.
5. **CSP is an HTTP header** in `vercel.json`. Do not add a `<meta>` CSP (the browser applies both and breaks audio and Quran features). Adding a new third-party host means editing the header deliberately.
6. **No user data through `innerHTML`.** Use `textContent` or the escaping helpers in `src/js/utils/dom.js`.
7. **Do not hand-edit `css/style.css`.** It is a single minified line with conflicting `:root` blocks, kept only for pages that have not been migrated. New work uses `css/tokens.css`.
8. **Do not touch `games/*` or `apps/*` internals** unless the task is about that game or app. They are separate PWAs with their own service workers and Android builds.

## Where things live

| Path | What |
|---|---|
| `*.njk`, `blog/*.njk`, `king-studio/*.njk` | Page templates |
| `_includes/layouts`, `_includes/partials`, `_includes/king-studio`, `_includes/studio` | Layouts and partials (shared header, footer, cards) |
| `_data/` | `site.json` (nav, ids), `studioCatalog.json` + `kingStudio.js` (catalogue), `downloads.js`, `releases.js` |
| `css/` | `tokens.css`, `site.css`, `home.css`, `king-studio.css`, `downloads.css`, `blog-post.css` |
| `js/`, `src/js/` | Page scripts; `src/js/home.js` drives the homepage settings dialog (`src/js/main.js` is legacy, still loaded by the KingCraft showcase) |
| `apks/` | Android builds and `updates.json` (the release manifest) |
| `scripts/` | Build tooling and the URL gate |
| `tests/` | `node:test` suites |
| `vercel.json` | Headers, redirects, rewrites |

## Conventions

- ES modules and vanilla JS. No new dependency without a written reason.
- Style with tokens from `css/tokens.css`; do not invent colours or spacing. Mobile-first, breakpoints 640 / 1024 / 1280px.
- Interactive targets at least 44px, text at least 12px, form inputs 16px (iOS zooms below that), visible focus, `prefers-reduced-motion` respected.
- Semantic HTML, one `h1` per page, headings in order, descriptive link text, `alt` on informative images.
- Honest content only: no invented testimonials, counts, ratings or download numbers. Status labels must match reality.

## Working on the King Studio catalogue

Add or edit a record in `_data/studioCatalog.json`. `_data/kingStudio.js` validates it at build time and **fails the build** on an unknown status, a missing image, launch URL or APK, or an image without `imageAlt`. APK version and file come from `apks/updates.json`. Do not hand-write catalogue pages.

## Languages

English is the default and keeps its URLs. German and Arabic versions of the core pages live under `/de/` and `/ar/` (`index.njk`, `about.njk`, `contact.njk` in each folder).

- `_data/site.json` → `translations` maps a page key to its path per language; `locales` lists the languages. A page opts in with `locale`, `translationKey` and, in a language folder, `root: "../"` in its front matter. That gives it `<html lang dir>` (the direction comes from the locale's `dir` string), `hreflang` alternates and the language switcher in the header.
- UI strings (header, footer, homepage, settings) are in `_data/i18n/<code>.json`. Every file must have exactly the keys of `en.json`; `tests/i18n.test.mjs` fails otherwise. The homepage body is one partial (`_includes/pages/home.njk`) shared by all languages; About and Contact are written per language.
- King Studio is translated: its pages live under `de/king-studio/` and `ar/king-studio/` and share the partials in `_includes/studio/`; per-project text comes from the `i18n.de` / `i18n.ar` fields of each record in `_data/studioCatalog.json` (English is the fallback). The blog, downloads and the legal pages are English only. Translated pages mark English-only blocks `lang="en"` (plus `dir="ltr"` on Arabic pages).
- Arabic is right-to-left: use logical CSS properties (`margin-inline-start`, `inset-inline`, `border-block`) rather than `left`/`right`, and give Latin-only snippets inside Arabic text (handles, emails, the brand) `dir="ltr"`.
- A new translated page needs: the template with an explicit `permalink`, an entry in `scripts/site-templates.mjs`, an entry in `site.translations`, and a `sitemap.xml` line.

## Gotchas that have already cost time

- Nunjucks `{% set %}` inside a `for` loop does not leak out of the loop (arrays and `.push()` do). Compute counts in a `_data/*.js` module instead.
- Eleventy data modules in `_data/` are ignored by the passthrough copy, so they never reach `dist/`.
- `downloads.njk` shows a SHA-256 computed from the real APK at build time, so an `updates.json` entry whose APK file is missing fails the build.
- Shell pages load `js/site-nav.js`; it needs `[data-menu-open]`, `[data-menu]`, `[data-menu-close]`, `[data-theme-toggle]` markup (see `_includes/partials/site-header.njk`). `tests/site-shell.test.mjs` enforces this.
- `/games/` redirects to `/king-studio/games/`; the games themselves stay at `/games/<name>/`.

## Git and review

- Work on a branch and open a pull request. Do not push to `main` directly, and do not merge without the owner's approval.
- Commit messages: `type(scope): short description` (for example `fix(ci): ...`). Explain the why in the body.
- CI runs a secret scan, `build`, `verify` and `test`. A green CI is required; do not skip or weaken tests to get it.

## CI and the Android workflow

`Build APKs` (`.github/workflows/apk-build.yml`) builds the Android apps with Capacitor and publishes to the `apks-latest` GitHub Release. It refuses to publish an APK that fails `apksigner verify`. A manual run takes a `project` input; a full run publishes files, so ask before dispatching it.
