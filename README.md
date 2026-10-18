<div align="center">

<img src="docs/readme/hero.png" alt="King Studio and the Rashid portfolio shown on a desktop browser and a phone" width="100%" />

<br/>

# Rashid · King Studio

**Games, apps and digital experiences, built in the open.**

A fast, installable portfolio and product studio. Browser games, Android apps and tools,
a blog and a downloads page, written in plain HTML, CSS and JavaScript on top of Eleventy.

<br/>

[![Live site](https://img.shields.io/badge/Live-rashid--wep.vercel.app-151515?style=for-the-badge&logo=vercel&logoColor=white&labelColor=d9b56d&color=151515)](https://rashid-wep.vercel.app)
[![King Studio](https://img.shields.io/badge/King%20Studio-Games%20%26%20Apps-d9b56d?style=for-the-badge&labelColor=151515)](https://rashid-wep.vercel.app/king-studio/)
[![CI](https://img.shields.io/github/actions/workflow/status/MOT1209/mein-wep/ci.yml?branch=main&style=for-the-badge&label=CI&labelColor=151515)](https://github.com/MOT1209/mein-wep/actions/workflows/ci.yml)

[![GitHub](https://img.shields.io/badge/GitHub-MOT1209-181717?style=flat-square&logo=github)](https://github.com/MOT1209)
[![YouTube](https://img.shields.io/badge/YouTube-مختبر%20البرمجة-ff0000?style=flat-square&logo=youtube&logoColor=white)](https://www.youtube.com/@مختبرالبرمجه)
[![TikTok](https://img.shields.io/badge/TikTok-@programmierlabor-000000?style=flat-square&logo=tiktok&logoColor=white)](https://www.tiktok.com/@programmierlabor)

</div>

---

## What's inside

<table>
  <tr>
    <td width="33%" valign="top"><b>🎮 Games</b><br/>KingCraft, Rust Construction and Farm Empire. 3D browser games with Android builds.</td>
    <td width="33%" valign="top"><b>📱 Apps</b><br/>Quran Pro, Calculator Vault and Quiz Master. Installable, work offline.</td>
    <td width="33%" valign="top"><b>🧪 Labs</b><br/>Rashid AI and Block World. Experiments, each labelled with its real status.</td>
  </tr>
  <tr>
    <td width="33%" valign="top"><b>⬇️ Downloads</b><br/>Every Android APK with a SHA-256 computed from the file at build time.</td>
    <td width="33%" valign="top"><b>✍️ Blog</b><br/>Articles on Three.js, PWAs, Supabase, CSS and AI.</td>
    <td width="33%" valign="top"><b>📚 Vault</b><br/>Prompts, code, docs, media and API references.</td>
  </tr>
</table>

<br/>

<div align="center">
<img src="docs/readme/s-downloads-d.png" alt="Downloads page with six Android releases" width="49%" />
<img src="docs/readme/s-home-d.png" alt="Portfolio homepage with project grid" width="49%" />
</div>

---

## Made for every screen

The whole site shares one design system and one navigation. A phone gets a full-screen menu with 44px touch targets, a desktop gets the inline header, and light or dark follows the visitor's choice and is remembered between pages.

<div align="center">
<img src="docs/readme/s-studio-m.png" alt="King Studio on a phone" width="30%" />
<img src="docs/readme/s-menu-m.png" alt="The mobile menu open on a phone" width="30%" />
</div>

---

## Quick start

```bash
git clone https://github.com/MOT1209/mein-wep.git
cd mein-wep
npm ci          # Node 20 or newer

npm start       # dev server with live reload
npm run build   # build to dist/
npm run verify  # dist/ must equal the tracked, servable files
npm test        # run `npm run build` first for the dist checks
```

---

## King Studio catalogue

The games, apps and labs pages are generated from data, so a dead link cannot be published.

```text
_data/studioCatalog.json   one record per project
_data/kingStudio.js        validates it at build time: a missing launch URL, image or APK fails the build
king-studio/*.njk          landing page, Games / Apps / Labs, one detail page per project
```

**Add a project:** add a record to `studioCatalog.json`, then run `npm run build`. APK versions come from `apks/updates.json`.

---

<details>
<summary><b>Repository layout</b></summary>

<br/>

```text
.
├── index.njk                 homepage
├── about / contact / privacy / terms .njk
├── 404.njk  downloads.njk  learning.njk
├── blog/*.njk                index and posts (keep their .html URLs through permalinks)
├── king-studio/*.njk         King Studio pages
├── _includes/                layouts and partials (shared header, footer, King Studio)
├── _data/                    site.json, studioCatalog.json, kingStudio.js, downloads.js, releases.js
├── css/                      tokens.css, site.css, home.css, king-studio.css, ...
├── js/                       site-nav.js (menu, theme), downloads.js, king-studio.js, ...
├── src/js/                   homepage modules
├── games/  apps/             standalone PWAs, copied as they are
├── apks/                     Android builds and updates.json
├── api/                      Vercel serverless functions
├── vault/  models/  admin/
├── scripts/                  build tooling and the URL-surface gate
├── tests/                    node:test suites
└── vercel.json               headers (CSP), rewrites, redirects
```

</details>

<details>
<summary><b>How the build works</b></summary>

<br/>

- Only `.njk` files are templates. Everything else is copied file by file from `git ls-files`, so `dist/` can only hold tracked, intended files.
- Files that must not be served (docs, tooling, other sub-projects, secrets) are listed in `eleventy.config.mjs` and mirrored in `scripts/check-url-surface.mjs`. **New files must be `git add`-ed before they appear in `dist/`.**
- A template that renders to a fixed `.html` URL needs an explicit `permalink` and an entry in `scripts/site-templates.mjs`, so the URL gate knows about it.

</details>

<details>
<summary><b>Design system</b></summary>

<br/>

Pages share `css/tokens.css` (colour, spacing, type, `--tap: 44px`) with `css/site.css` on top. The homepage adds `css/home.css`, King Studio adds `css/king-studio.css` (charcoal and gold). Breakpoints: 640px, 1024px, 1280px. The theme is stored under the `theme` key in `localStorage` and applied as `data-theme` on `<html>`.

The older `css/style.css` is still used by `devos.html`, `vault/*` and a few pages that have not been migrated yet.

</details>

---

## Deployment

- **Vercel** project `rashid-wep` deploys `main` to https://rashid-wep.vercel.app with `npm run build`. Pull requests get preview deployments.
- **GitHub Actions:** `CI` runs the secret scan, build, verify and tests. `Build APKs` builds the Android apps with Capacitor and publishes them to a GitHub Release (see [`docs/APK_HOSTING.md`](docs/APK_HOSTING.md)).
- Environment variables for `api/*` (Supabase, Gemini and others) live in the Vercel project settings, never in the repository.

> [!WARNING]
> The repository root is the deploy root. Do not run `git add .` or `git add -A` blindly. Stage files by explicit path and check `git status` first, so internal folders and secrets cannot reach the public site.

---

<div align="center">

**Contact** · [zwnt45602@gmail.com](mailto:zwnt45602@gmail.com) · [GitHub](https://github.com/MOT1209) · [rashid-wep.vercel.app](https://rashid-wep.vercel.app)

<sub>Built in the open by Rashid.</sub>

</div>
