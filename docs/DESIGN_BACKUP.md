# Rashid Portfolio — Design Backup v8.0
> هذا الملف يحفظ حالة التصميم الصحيحة. إذا تعطّل التصميم، أعد إنشاء الملفات من هذا المرجع.

---

## 1. File Structure (Critical Files)

```
index.html              → الصفحة الرئيسية
css/style.css           → ملف CSS الرئيسي (2973 سطر)
css/enhancements.css    → تحسينات إضافية (669 سطر)
css/admin.css           → لوحة الإدارة
css/app-mode.css        → وضع التطبيق
css/mobile-improvements.css → تحسينات الموبايل

src/css/main.css        → يستورد الملفات الفرعية
src/css/base/variables.css  → المتغيرات الأساسية
src/css/base/responsive.css → الاستجابة للموبايل
src/css/components/navbar.css  → شريط التنقل
src/css/components/hero.css    → قسم البطل
src/css/components/design-system.css → نظام التصميم (أزرار، بطاقات، badges)

src/js/main.js          → نقطة الدخول الرئيسية (ES Module)
src/js/modules/         → 12 وحدة JS
src/js/services/        → خدمات (analytics, supabase)
src/js/utils/           → أدوات مساعدة (cache, dom, thumbnails)
```

---

## 2. CSS Variables (style.css — :root)

```css
:root {
  --font-heading: 'Bricolage Grotesque', sans-serif;
  --font-body: 'Space Grotesk', sans-serif;
  --font-mono: 'JetBrains Mono', monospace;

  --bg-main: #050507;
  --bg-secondary: #0a0a0f;
  --bg-alt: #0d0d14;
  --bg-glass: rgba(10, 10, 15, 0.72);

  --text-high: #f1f5f9;
  --text-med: #a8b5c9;
  --text-low: #8596b0;

  --accent: #6366f1;
  --accent-rgb: 99, 102, 241;
  --accent-glow: rgba(99, 102, 241, 0.28);
  --accent-dark: #4f46e5;
  --accent-2: #22d3ee;
  --accent-2-rgb: 34, 211, 238;

  --border: rgba(255, 255, 255, 0.07);
  --border-accent: rgba(var(--accent-rgb), 0.35);
  --shadow-sm: 0 1px 3px rgba(0, 0, 0, 0.5);
  --shadow-lg: 0 20px 60px -15px rgba(0, 0, 0, 0.7);

  --section-gap: 120px;
  --section-padding: 120px 0;
  --container-width: 1200px;
  --radius-lg: 24px;
  --radius-md: 16px;
  --radius-sm: 12px;
  --transition-speed: 0.3s;
  --transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
}

body.light-mode {
  --bg-main: #f8fafc;
  --bg-secondary: #f1f5f9;
  --bg-alt: #e8edf4;
  --bg-glass: rgba(255, 255, 255, 0.82);
  --text-high: #0f172a;
  --text-med: #475569;
  --text-low: #6b7c99;
  --accent: #4f46e5;
  --accent-rgb: 79, 70, 229;
  --accent-glow: rgba(79, 70, 229, 0.2);
  --accent-dark: #4338ca;
  --accent-2: #0891b2;
  --border: rgba(0, 0, 0, 0.07);
  --border-color: rgba(0, 0, 0, 0.07);
  --card-bg: rgba(255, 255, 255, 0.82);
}
```

---

## 3. HTML Structure (index.html)

### Head:
- Meta tags: charset, viewport, description, robots, keywords, author
- Open Graph + Twitter Cards
- hreflang: en, ar, de
- Google Fonts: Bricolage Grotesque, Space Grotesk, JetBrains Mono
- Font Awesome 6.4.0
- CSS load order:
  1. `src/css/main.css?v=1.0` (render-blocking)
  2. `css/style.css?v=8.0` (render-blocking)
  3. `src/css/base/variables.css?v=1.0` (render-blocking)
  4. `src/css/base/responsive.css?v=1.0` (render-blocking)
  5. `src/css/components.css?v=1.0` (render-blocking)
  6. `css/admin.css?v=3.0` (deferred via media="print" onload trick)
  7. `css/app-mode.css?v=3.0` (deferred)
  8. `css/mobile-improvements.css?v=1.0` (deferred)
  9. `css/enhancements.css?v=1.0` (deferred)
- Supabase JS CDN (defer)
- `js/supabase-config.js?v=1.1` (defer)
- PWA Manifest + Theme Color
- Google AdSense script (async)

### Body (class="dark-mode"):
1. Skip-to-content link
2. `.bg-mesh` — dynamic background
3. `nav.navbar` — navigation bar
4. `.mobile-menu` — mobile overlay menu
5. `header#hero` — hero section
6. `section#models` — AI models cards
7. `section#github` — GitHub stats
8. `section#vault` — Knowledge Vault (lazy-loaded subsections)
9. `section#projects` — Project Matrix (dynamic)
10. `section#about` — About Rashid + timeline
11. `section#experience` — Experience timeline
12. `section#contact` — Contact form + social links
13. Settings modal (overlay + modal)
14. `footer.main-footer` — footer
15. Voice Widget (Rashid-AI v3.0 chatbot)

### Scripts (at bottom):
1. `js/gemini-config.js`
2. Google Translate (lazy via requestIdleCallback)
3. `js/rashid-ai-v2.js?v=3.0`
4. `<script type="module" src="src/js/main.js?v=2.0">` ← **CRITICAL**
5. `js/admin.js?v=3.1` (defer)
6. `js/pwa-installer.js?v=1.1` (defer)
7. JSON-LD structured data (WebSite, Person, BreadcrumbList)

---

## 4. JS Module Map (main.js imports)

| Import | Source | Status |
|--------|--------|--------|
| `createCachedElements` | `./utils/cache.js` | ✅ |
| `initSupabase, onAuthStateChange, fetchPublic, subscribe` | `./modules/supabase.js` | ✅ |
| `initTheme` | `./modules/theme.js` | ✅ |
| `initNavbar` | `./modules/navbar.js` | ✅ |
| `initMobileMenu` | `./modules/mobile.js` | ✅ |
| `initAnimations` | `./modules/animations.js` | ✅ |
| `initProjectFilters, initProjects` | `./modules/projects.js` | ✅ |
| `initSettings` | `./modules/settings.js` | ✅ |
| `initAnalytics, trackContactFormSubmit` | `./services/analytics.js` | ✅ |
| `incrementVisitorCount` | `./services/supabase.js` | ✅ |
| `qs, qsa, on` | `./utils/dom.js` | ✅ |
| `initTypewriter, initTechStackMarquee, initLiveStats, initTestimonials, initProjectModal, initCustomPwaInstall, initScrollProgress` | `./modules/enhancements.js` | ✅ |
| `initLatestUpdates` | `./modules/updates.js` | ✅ |
| `initStatistics` | `./modules/statistics.js` | ✅ |
| `initVaultSearch` | `./modules/vault.js` | ✅ |
| `renderGitHubStats` | `./modules/github.js` | ✅ |

### Vault Sections (lazy-loaded via IntersectionObserver):
- All export `initSection(cached)` — NOT individual names
- `import('../vault/prompts.js').then(mod => mod.initSection(cached))`
- `import('../vault/images.js').then(mod => mod.initSection(cached))`
- `import('../vault/codes.js').then(mod => mod.initSection(cached))`
- `import('../vault/media.js').then(mod => mod.initSection(cached))`

### ⚠️ NEVER add static imports for vault sections in main.js!
The vault files only export `initSection`, not `initPromptsSection` etc.

---

## 5. Supabase Config

```javascript
const Rashid_SUPABASE = Object.freeze({
    url: 'https://mspxwccbczhtaexwyhya.supabase.co',
    anonKey: 'sb_publishable_IvhF2CRGL0FTorPACmzh6g_-t94bItu'
});
```

---

## 6. Known Issues (DO NOT REINTRODUCE)

1. **Static vault imports crash the entire site** — Lines 34-37 in main.js previously imported `initPromptsSection`, `initImagesSection`, `initCodesSection`, `initMediaSection` from vault files, but those files only export `initSection`. This caused a module loading error that killed the entire JS execution, resulting in a blank page.

2. **Supabase connection errors** — The Supabase URL resolves but returns timeout errors for `bot_knowledge` table. This is non-blocking (errors are caught).

3. **Missing favicon** — `favicon.ico` returns 404. Cosmetic only.

---

## 7. Theme System

- Dark mode default: `body.dark-mode` / `body` default styles
- Light mode: `body.light-mode` class toggled
- Nano Banana 2 theme: Toggle in settings (`#nano-banana-toggle`)
- Performance mode: Disable animations (`#perf-mode`)
- Accent color picker: 5 colors (blue, pink, green, yellow, purple)
- Language: EN/AR/DE via Google Translate

---

## 8. CSS Load Order (index.html)

```html
<!-- Critical CSS (render-blocking) -->
<link rel="stylesheet" href="src/css/main.css?v=1.0">
<link rel="stylesheet" href="css/style.css?v=8.0">
<link rel="stylesheet" href="src/css/base/variables.css?v=1.0">
<link rel="stylesheet" href="src/css/base/responsive.css?v=1.0">
<link rel="stylesheet" href="src/css/components.css?v=1.0">

<!-- Non-critical CSS (deferred) -->
<link rel="stylesheet" href="css/admin.css?v=3.0" media="print" onload="this.media='all'">
<link rel="stylesheet" href="css/app-mode.css?v=3.0" media="print" onload="this.media='all'">
<link rel="stylesheet" href="css/mobile-improvements.css?v=1.0" media="print" onload="this.media='all'">
<link rel="stylesheet" href="css/enhancements.css?v=1.0" media="print" onload="this.media='all'">
```

---

*Last backup: 2026-06-12 — Fixed static vault import crash*
