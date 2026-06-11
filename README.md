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

A comprehensive personal platform built with vanilla HTML/CSS/JS, featuring:

- **3D Browser Games** — Three.js sandbox worlds (KingCraft, Rust Construction, Farm Empire)
- **AI Assistant** — Rashid AI, powered by Google Gemini API
- **PWA Applications** — Quran, Calculator Vault, Quiz Master
- **Knowledge Vault** — Prompts, code, docs, media, archives, API references
- **Admin Dashboard** — Login-secured management interface
- **AdSense Monetization** — across 21 pages with full SEO optimization

All games and apps are **Progressive Web Apps** — installable, offline-capable, with Service Workers.

---

## Projects

### Games

| Game | Tech | Type |
|---|---|---|
| [KingCraft](games/kingcraft-game/) | Three.js, Voxel | 3D Sandbox Survival — mine, craft, fight mobs, build |
| [Rust Construction](games/rust-game/) | Three.js, WASM | 3D Physics Sandbox — resource management, building |
| [Farm Empire](games/farm-game/) | WebGL | Farming Simulation — crops, animals, economy |

### Apps

- **Quran Pro** — Full Quran with 40+ reciters, tafsir, bookmarks, offline
- **Calculator Vault** — Privacy-first calculator that hides a secret vault
- **Quiz Master** — Multi-category quiz platform with progress tracking

### AI Models

- **Rashid AI v2.0** — Conversational AI with Gemini API, multilingual, voice

### Knowledge Vault

- Prompts | Code Library | Documentation | Media | Archive | API Reference

---

## Architecture

```
root/
├── index.html              # Homepage — hero, models, vault, projects, contact
├── about.html / contact.html
├── privacy.html / terms.html  # Legal pages
├── offline.html               # PWA offline fallback

├── games/                     # Browser games (each with manifest.json + sw.js)
│   ├── kingcraft-game/        # 3D voxel sandbox (Three.js)
│   ├── rust-game/             # 3D physics sandbox (Three.js WASM)
│   ├── farm-game/             # Farming simulation (WebGL)
│   └── index.html             # Arcade hub

├── apps/                      # PWA applications
│   ├── quran-app/             # Quran with offline recitation
│   ├── calculator-vault/      # Hidden vault behind calculator
│   └── quiz-app/              # Interactive quiz platform

├── models/Rashid-Model/       # AI chat interface (Gemini API)

├── vault/                     # Knowledge vault (6 categories)
├── admin/                     # Admin login + dashboard
├── src/                       # Modular source code
│   ├── css/                   # variables, responsive, design-system, components
│   └── js/modules/            # 12 feature modules (projects, vault, theme, etc.)
│
├── game-hoster/               # Next.js 16 sub-project (game hosting platform)
├── game-vault/                # Static export of game-hoster
│
├── css/                       # Root stylesheets
├── js/                        # Root scripts
├── images/                    # Logo, avatar, profile
└── design-concepts/           # SVG mockups
```

---

## Tech Stack

### Main Site (Vanilla)
- **HTML5** — Semantic markup, ARIA, JSON-LD structured data
- **CSS3** — Custom properties, glassmorphism, dark/light mode, animations
- **JavaScript** — ES6+ modular architecture (12 modules)
- **Fonts** — Google Fonts (Bricolage Grotesque, Space Grotesk, JetBrains Mono)
- **Icons** — Font Awesome 6.4

### Backend & AI
- **Supabase** — Real-time database, authentication, CDN client
- **Google Gemini API** — AI assistant (gemini-1.5-flash)

### PWA
- Service Worker with offline caching
- Web App Manifest for installability
- All games/apps individually installable

### Sub-project: game-hoster
- **Next.js 16** + **React 19** + **TypeScript**
- **Tailwind CSS v4** + **Framer Motion**
- Static export (`output: 'export'`) served under `/game-vault/`

### Deployment
- **Vercel** (primary) — auto-deploys from `main` branch
- **GitHub Pages** (secondary) — via `.nojekyll`

---

## Development

This is a **static site** — no build step required for the main platform:

```bash
# Clone
git clone https://github.com/MOT1209/mein-wep.git

# Serve locally (any static server)
python -m http.server 8080
# or
npx serve .
```

To build the Next.js sub-project:

```bash
cd game-hoster
npm install
npm run build   # outputs to out/ → game-vault/
```

---

## Deployment

The platform auto-deploys via **Vercel** on every push to `main`:

```
git add .
git commit -m "..."
git push origin main
# → Vercel deploys to https://rashid-wep.vercel.app
```

GitHub Pages is also configured: `https://mot1209.github.io/mein-wep/`

---

## Game Development Notes

### KingCraft (active development)
- **Phase 1+2**: World generation, player movement, health/hunger, crafting, furnaces
- **Phase 3** (current): Mobs (zombie, skeleton, creeper, spider, cow, sheep, chicken, pig), combat, armor system
- Phase 4 planned: Caves, biomes, redstone, enchantments

### Rust Construction
- Three.js physics engine, WASM compilation
- Resource mining, structural integrity simulation

### Farm Empire
- WebGL rendering, crop growth simulation, animal management

---

## Contact

- **Email**: zwnt45602@gmail.com
- **GitHub**: [MOT1209](https://github.com/MOT1209)
- **Platform**: [rashid-wep.vercel.app](https://rashid-wep.vercel.app)

---

*Built with ❤️ by Rashid.*
