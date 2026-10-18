# Rashid — AI Workspace & Developer Portfolio

> A full-stack developer portfolio, AI workspace, game hub, and PWA app center — all in one platform.

<div align="center">
  <img src="https://github-readme-stats.vercel.app/api?username=MOT1209&show_icons=true&theme=midnight-purple&hide_border=true&include_all_commits=true&count_private=true" alt="GitHub Stats" />
  <img src="https://github-readme-streak-stats.herokuapp.com/?user=MOT1209&theme=midnight-purple&hide_border=true" alt="GitHub Streak" />
  <br/>
  <img src="https://github-readme-stats.vercel.app/api/top-langs/?username=MOT1209&layout=compact&theme=midnight-purple&hide_border=true&langs_count=8" alt="Top Languages" />
  <br/>
  <img src="https://github-profile-trophy.vercel.app/?username=MOT1209&theme=midnight-purple&no-bg=true&no-frame=true&row=2&column=4" alt="Trophies" />
</div>

<p align="center">
  <a href="https://rashid-wep.vercel.app"><img src="https://img.shields.io/badge/Portfolio-rashid--wep.vercel.app-8b5cf6?style=for-the-badge&logo=vercel&logoColor=white" alt="Portfolio" /></a>
  <a href="https://github.com/MOT1209"><img src="https://img.shields.io/badge/GitHub-MOT1209-8b5cf6?style=for-the-badge&logo=github&logoColor=white" alt="GitHub" /></a>
  <a href="https://www.youtube.com/@مختبرالبرمجه"><img src="https://img.shields.io/badge/YouTube-مختبرالبرمجه-ff0000?style=for-the-badge&logo=youtube&logoColor=white" alt="YouTube" /></a>
  <a href="https://www.tiktok.com/@programmierlabor"><img src="https://img.shields.io/badge/TikTok-@programmierlabor-000000?style=for-the-badge&logo=tiktok&logoColor=white" alt="TikTok" /></a>
</p>

---

## Overview

Rashid's personal site: a developer portfolio, a games & apps catalogue (**King Studio**), a blog, and a downloads page for the Android builds. It is a static site built with [Eleventy](https://www.11ty.dev/) on top of plain HTML, CSS and JavaScript. There is no framework and no backend of its own; a few serverless functions in `api/` handle the contact form and AI requests.

| Area | URL | What it is |
|---|---|---|
| Portfolio | `/` | Projects, about, contact |
| **King Studio** | `/king-studio/` | Games, apps and labs catalogue with a detail page per project |
| Blog | `/blog/` | 8 articles |
| Downloads | `/downloads.html` | Android APKs with SHA-256 computed at build time |
| Games | `/games/…` | KingCraft, Rust Construction, Farm Empire (`/games/` redirects to King Studio) |
| Apps | `/apps/…`, `/quran.html` | Calculator Vault, Quiz Master, Quran Pro |
| AI | `/models/Rashid-Model/` | Rashid AI chat (Gemini / OpenRouter) |
| Knowledge vault | `/vault/…` | Prompts, code, docs, media, archive, API reference |
| Admin | `/admin/` | Login-protected dashboard |

---

## King Studio

The catalogue is driven by data, not hand-written pages:

- `_data/studioCatalog.json` holds one record per project (title, description, platforms, status, image, launch URL, APK id…).
- `_data/kingStudio.js` validates it **at build time**: a launch URL, image or APK that does not exist fails the build instead of publishing a dead link. APK versions come from `apks/updates.json`.
- `king-studio/*.njk` render the landing page, the Games / Apps / Labs catalogues and one detail page per record (`king-studio/project.njk`, paginated).

To add a project, add a record to `studioCatalog.json` and run `npm run build`.

---

## Projects

### Games
| Game | Tech |
|---|---|
| [KingCraft](games/kingcraft-game/) | Three.js voxel sandbox: mine, craft, build, fight mobs |
| [Rust Construction](games/rust-game/) | Three.js physics building game |
| [Farm Empire](games/farm-game/) | WebGL farming simulation |

Each has a web manifest and service worker, plus an Android build (Capacitor). `games/kingcraft1/` (Block World) is an early-development Vite/TypeScript voxel game and is **not** published yet.

### Apps
- **Quran Pro** (`quran.html`): tafsir, 40+ reciters, search, bookmarks
- **Calculator Vault** (`apps/calculator-app/`): a calculator that hides a private vault
- **Quiz Master** (`apps/quiz-app/`): multi-category quiz with progress tracking

### Rashid AI
Conversational assistant in `models/Rashid-Model/`; server calls go through `api/gemini.js`.

---

## Repository layout

```
.
├── index.njk                  # Homepage
├── about / contact / privacy / terms .njk
├── 404.njk, downloads.njk, learning.njk
├── blog/*.njk                 # Index + posts (keep their .html URLs via permalinks)
├── king-studio/*.njk          # King Studio pages
├── _includes/                 # Layouts and partials (shared header/footer, King Studio)
├── _data/                     # site.json, studioCatalog.json, kingStudio.js, downloads.js, releases.js
├── css/                       # tokens.css (design tokens), site.css, home.css, king-studio.css, …
├── js/                        # site-nav.js (mobile menu, theme), downloads.js, king-studio.js, …
├── src/js/                    # Homepage modules (projects, theme, vault, …)
├── games/  apps/              # Standalone PWAs, copied verbatim to dist/
├── apks/                      # Android builds + updates.json (release manifest)
├── api/                       # Vercel serverless functions
├── vault/ models/ admin/      # Vault, AI chat, admin
├── scripts/                   # Build tooling and URL-surface gate
├── tests/                     # node:test suites
└── vercel.json                # Headers (CSP), rewrites, redirects
```

### How the build works

- Only `.njk` files are templates. Everything else is **copied file by file** from `git ls-files`, so `dist/` can only contain tracked, intended files.
- Anything that must not be served (docs, tooling, other sub-projects, secrets) is listed in `eleventy.config.mjs` and mirrored in `scripts/check-url-surface.mjs`. **New files must be `git add`-ed before they appear in `dist/`.**
- A template that renders to a fixed `.html` URL needs an explicit `permalink`, and must be registered in `scripts/site-templates.mjs` so the URL gate knows about it.

### Design system

All secondary pages use `css/tokens.css` (colours, spacing, type, a `--tap: 44px` touch target) with `css/site.css` on top; the homepage adds `css/home.css` and King Studio adds `css/king-studio.css`. Light/dark follows the visitor's choice (`localStorage` key `theme`, attribute `data-theme` on `<html>`). Breakpoints: 640px, 1024px, 1280px. The legacy `css/style.css` is still used by `devos.html`, `vault/*` and a few other pages that have not been migrated.

---

## Development

Requires Node 20 or newer.

```bash
git clone https://github.com/MOT1209/mein-wep.git
cd mein-wep
npm ci

npm start          # Eleventy dev server with live reload
npm run build      # build to dist/
npm run verify     # URL-surface gate: dist/ must equal the tracked, servable files
npm test           # node:test suites (run `npm run build` first for the dist checks)
```

The `dist/` tests check, among other things, that every King Studio link and image resolves, that every shell page wires its mobile menu, and that no internal file is published.

---

## Deployment

- **Vercel** project `rashid-wep` deploys `main` to https://rashid-wep.vercel.app using `npm run build` (output `dist/`). Pull requests get preview deployments.
- GitHub Actions: `CI` runs the secret scan, build, verify and tests; `Build APKs` builds the Android apps with Capacitor and publishes them to a GitHub Release (see `docs/APK_HOSTING.md`).
- GitHub Pages is **not** used any more (`deploy.yml` is manual-only, kept for reference).
- Environment variables for `api/*` (Supabase, Gemini, …) are set in the Vercel project settings, never in the repository.

> The repository root is the deploy root. Never run `git add .` or `git add -A` blindly: stage files by explicit path and check `git status` first, so internal folders and secrets cannot reach the public site.

---

## Contact

- **Email**: zwnt45602@gmail.com
- **GitHub**: [MOT1209](https://github.com/MOT1209)
- **Site**: [rashid-wep.vercel.app](https://rashid-wep.vercel.app)

---

*Built in the open by Rashid.*
