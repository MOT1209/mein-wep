# PRD — Rashid: AI Workspace & Developer Portfolio

**Status**: Living document — reflects current state (v8.0 "Deep Signal" design system)
**Owner**: Rashid (MOT1209)
**Last updated**: 2026-07-01

---

## 1. Summary

Rashid's platform is a single-owner, personal web platform combining a developer portfolio, an AI assistant, a game arcade, a set of installable PWA apps, and a personal knowledge vault. It is built as a vanilla HTML/CSS/JS static site (no framework, no build step) with Supabase as the backend and Google Gemini as the AI layer, deployed on Vercel (primary) and GitHub Pages (secondary).

## 2. Goals

- Present Rashid's work (games, apps, AI models) as a cohesive, professional portfolio.
- Provide a working AI assistant (Rashid AI) as a live demo of AI-integration skill.
- Host original, playable 3D browser games as flagship portfolio pieces.
- Offer small utility PWA apps (Quran, Calculator Vault, Quiz Master) that are installable and offline-capable.
- Keep the whole site fast, static, and framework-free so it stays cheap to host and easy to reason about.
- Monetize traffic via AdSense without compromising UX or Core Web Vitals.

## 3. Non-goals

- No migration to a JS framework (React/Vue/etc.) for the main site — vanilla stack is an intentional, standing constraint (see [[feedback-design]]).
- No multi-tenant / multi-user platform — this is a single-owner personal site, not a SaaS product.
- No full redesign of the existing visual identity — evolve the v8.0 "Deep Signal" design system incrementally, not overhaul it (user has rejected full redesigns twice).
- No native mobile app for the main portfolio (individual games/apps are installable PWAs instead).

## 4. Target users

- Recruiters / potential clients or employers evaluating Rashid's skills.
- Visitors who want to play the browser games (KingCraft, Rust Construction, Farm Empire) casually.
- Users of the utility PWA apps (Quran reciters, quiz, calculator vault) as standalone tools.
- Rashid himself, using the AI assistant and admin dashboard as a personal workspace.

## 5. Product surface (current)

### 5.1 Core site
- `index.html` — hero, AI models section, knowledge vault, projects, about, experience, contact.
- `about.html`, `contact.html`, `privacy.html`, `terms.html`, `offline.html` (PWA fallback).
- Blog (`blog/`) — unified data layer, shared CSS, dynamic index, auto-generated RSS.
- Admin (`admin/`) — login-secured dashboard for content/site management.

### 5.2 Games (`games/`)
| Game | Tech | Status |
|---|---|---|
| KingCraft | Three.js, voxel | Active dev — Phase 3 (mobs, combat, armor); Phase 4 planned (caves, biomes, redstone) |
| Rust Construction | Three.js + WASM | Physics sandbox, resource/structural simulation |
| Farm Empire | WebGL | Farming simulation — crops, animals, economy |

### 5.3 Apps (`apps/`)
- **Quran Pro** — 40+ reciters, tafsir, bookmarks, offline.
- **Calculator Vault** — privacy-first calculator hiding a secret vault.
- **Quiz Master** — multi-category quiz with progress tracking.

All games/apps are individually installable PWAs (own `manifest.json` + service worker).

### 5.4 AI models (`models/`)
- **Rashid AI v2.0** (`models/Rashid-Model/`) — conversational assistant, Gemini API, multilingual, voice input.
- **KING2** — separate AI platform effort; live product deploys from a different repo ([[project-king2-repos]]), Next.js frontend on Vercel with Gemini vision ([[project-king2-nextfrontend]]), plus a standalone SDXL LoRA image model ([[project-king2-image]]). Tracked here only as a cross-linked initiative, not part of this repo's deploy.

### 5.5 Knowledge vault (`vault/`)
Six categories: Prompts, Code Library, Documentation, Media, Archive, API Reference.

### 5.6 Sub-project: `game-hoster/`
Next.js 16 + React 19 + TypeScript + Tailwind v4 + Framer Motion, statically exported (`output: 'export'`) and served under `/game-vault/`. This is the one exception to "no build step" — isolated, pre-built, and shipped as static output.

## 6. Tech stack & architecture constraints

- **Frontend**: HTML5 (semantic, ARIA, JSON-LD), CSS3 (custom properties, glassmorphism, dark/light mode), vanilla ES6+ modules (12 modules under `src/js/modules/`). No bundler for the main site.
- **CSS load order** (last wins): `src/css/main.css` → `css/style.css` (v8.0) → `css/enhancements.css`.
- **Design system v8.0 "Deep Signal"**: Bricolage Grotesque (display) + Space Grotesk (body) + JetBrains Mono; background `#050507` with CSS-only aurora orbs; accent `#6366f1` (Electric Indigo, JS-overridable) + secondary `#22d3ee` (Cyan).
- **Backend**: Supabase (DB, auth, CDN client) — anon role requires `EXECUTE` on `is_admin()` or site content 401s ([[project-supabase-isadmin-grant]], project ref `kcltollasghlvuoxvjqa`).
- **AI**: Google Gemini API (`gemini-1.5-flash`) for Rashid AI.
- **PWA**: Service worker (`sw.js`, cache `Rashid-v11`), web manifest, offline fallback page.
- **Deployment**: Vercel (auto-deploy on push to `main`) is primary; GitHub Pages (`.nojekyll`, `enablement: true` in `deploy.yml`) is secondary/mirror.
- **Monetization**: AdSense across 21 pages, with consent handling and SEO optimization already applied.

### Hard constraints (do not violate without explicit discussion)
1. **No framework migration** for the main site — vanilla only.
2. **JS-controlled class/id names must never be renamed** without updating all references — includes `.reveal`/`.reveal.active`, `.navbar`/`.navbar.scrolled`, `.filter-btn.active`, `.project-card`, `.vault-item`, `.model-card`, `.glass-card`, `.blur-glass`, `.hamburger`, `.mobile-menu`/`.mobile-menu.active`, `.bar`, section ids (`#hero`, `#models`, `#vault`, `#projects`, `#about`, `#experience`, `#contact`), settings/theme ids, and `#gaming-grid`/`#apps-grid` (must stay empty in HTML — JS fills them).
3. **CSS vars `--accent`/`--accent-glow`** are written at runtime by `src/js/modules/theme.js` — treat as dynamic, not static.
4. **Design evolves, it does not get overhauled** — see [[feedback-design]]: two prior full-redesign proposals were rejected in favor of incremental improvement of the existing v8.0 system.

## 7. Quality bar / non-functional requirements

- Core Web Vitals must stay healthy — no regressions from AdSense, iframes, or fonts.
- SEO: hreflang, JSON-LD, sitemap, RSS (blog) already in place — new content must follow the same pattern.
- Security: SHA-256 integrity where applicable, iframe sandboxing, AdSense consent flow — already applied per the "technical audit" commit; new third-party embeds must meet the same bar.
- PWA correctness: every game/app must remain independently installable and offline-capable; service worker cache version must be bumped on any asset-affecting change.
- Multilingual: Arabic-first content conventions in commit history — new user-facing copy should support/consider Arabic where the existing page does.

## 8. Open questions / not yet decided

- Formal roadmap for KingCraft Phase 4 (caves, biomes, redstone, enchantments) — scoped in commit history but not broken into tracked tasks.
- Whether `game-hoster`/`game-vault` stays a parallel static export long-term or gets folded into the main deploy pipeline.
- No formal analytics/success-metric targets (traffic, install counts, AI usage) are defined yet — currently qualitative ("portfolio should look and feel professional").

## 9. Out of scope for this document

Implementation-level task tracking (bug fixes, per-page copy, individual PR scope) belongs in issues/commits, not here. This PRD describes what the platform *is* and its standing constraints, not a sprint plan.
