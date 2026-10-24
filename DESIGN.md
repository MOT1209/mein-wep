# DESIGN.md

The visual rules for rashid-wep.vercel.app. The source of truth is the code: `css/tokens.css` for the values, `css/site.css` for the shared components. If this file and the CSS disagree, the CSS wins; fix this file.

## Principles

1. **One system.** Every page reads its colour, spacing and type from `css/tokens.css`. No hex codes or pixel values invented per page.
2. **Mobile first, and real on desktop.** Design the phone layout, then widen. A phone gets a full-screen menu and 44px targets; a desktop gets the inline header.
3. **Quiet.** Mostly neutral surfaces, one accent, hairlines instead of heavy shadows, motion only for state feedback.
4. **Honest.** Status labels, counts and screenshots must match reality. No invented testimonials, ratings or download numbers.
5. **Accessible by default.** Contrast, focus, keyboard, reduced motion and touch size are part of the design, not a later pass.

## Themes

Light is the default; dark is `:root[data-theme="dark"]`. The pre-paint script in `_includes/partials/site-head.njk` sets `data-theme` from `localStorage.theme`, falling back to the OS setting. **King Studio** pages default to dark when nothing is stored. The toggle (`[data-theme-toggle]`, handled by `js/site-nav.js`) writes the same `theme` key, so the choice carries across pages.

## Colour tokens (`css/tokens.css`)

| Token | Light | Dark | Use |
|---|---|---|---|
| `--paper` | `#f7f9fc` | `#0b1220` | Page ground |
| `--card` | `#ffffff` | `#111a2b` | Raised surfaces |
| `--card-sunk` | `#eef2f8` | `#16213a` | Inset wells, code, hover rows |
| `--rule` | `#e2e8f0` | `#1f2a40` | Hairlines |
| `--rule-strong` | `#cbd5e1` | `#2c3a55` | Dividers that carry weight, input borders |
| `--ink` | `#0f172a` | `#e5ecf6` | Headings, primary text |
| `--ink-soft` | `#334155` | `#c3cede` | Body text on long pages |
| `--ink-muted` | `#475569` | `#93a1b8` | Supporting copy |
| `--ink-faint` | `#5b6779` | `#8593a9` | Metadata, eyebrows (5.44:1 light, 6.01:1 dark) |
| `--signal` | `#2563eb` | `#60a5fa` | The one accent (tech blue): links, primary buttons, active states |
| `--signal-hover` | `#1d4ed8` | `#93c5fd` | Accent hover |
| `--on-signal` | `#ffffff` | `#0b1220` | Text on `--signal` |
| `--signal-wash` / `--signal-edge` | `#eff4ff` / `#c7d7fe` | `#0f1d3a` / `#1e3a6e` | Accent chips, active nav |
| `--ok` / `--ok-wash` | `#15803d` / `#eefbf2` | `#4ade80` / `#10231a` | Status only, never decoration |

Rules: text on `--paper` must be `--ink`, `--ink-soft` or `--ink-muted`; use `--ink-faint` only for non-essential metadata. `--ok` encodes "available / success" and nothing else.

### King Studio brand layer (`css/king-studio.css`)

King Studio uses the same blue as the rest of the site, framed in navy: a fixed navy header and hero with the blue accent.

| Token | Value | Use |
|---|---|---|
| `--ks-charcoal` | `#0b1220` | Header, hero, active filter chip (both themes) |
| `--ks-accent` | `#60a5fa` | Accent on navy (7.36:1); focus ring; primary hero button |
| `--ks-accent-ink` | `#1d4ed8` light, `#60a5fa` dark | The accent used as **text** on themed surfaces |
| `--ks-accent-wash` / `--ks-accent-edge` | `#eff4ff` / `#c7d7fe` light, `#0f1d3a` / `#1e3a6e` dark | "In development" and "Experimental" chips |

Wordmark: `KING STUDIO` in the display font, letter-spaced, with an inline SVG crown. Tagline: "Build. Create. Innovate."

## Typography

| Role | Token | Stack |
|---|---|---|
| Display (headings, wordmark) | `--font-display` | Bricolage Grotesque, Trebuchet MS, sans-serif |
| Body | `--font-body` | IBM Plex Sans, system sans-serif |
| Data, labels, code | `--font-mono` | JetBrains Mono, ui-monospace |

Scale in use: page title `clamp(1.875rem, 6vw, 2.75rem)` weight 800; section heading `1.375rem`; card title `1.0625rem` to `1.25rem`; body `1rem` to `1.0625rem`; metadata `0.75rem` to `0.875rem`. **Minimum text size is 12px (`0.75rem`).** Form inputs are 16px so iOS Safari does not zoom on focus. Running text is capped at `--measure` (68ch). Headings use tight tracking (`letter-spacing: -0.01em`).

## Spacing, shape, elevation

- Spacing scale: `--s-1` 4, `--s-2` 8, `--s-3` 12, `--s-4` 16, `--s-5` 24, `--s-6` 32, `--s-7` 48, `--s-8` 64, `--s-9` 96 (px). Do not use off-scale values.
- Radius: `--radius` 10px (buttons, inputs), `--radius-sm` 6px (small controls), cards 14px, pills 999px.
- Elevation: `--lift` at rest, `--lift-hover` on hover. Hairlines (`--rule`) do most of the work.
- Layout: content max-width 1200px (`.wrap`), reading pages 820px (`.page`), blog posts 760px. Side padding 16px on phones, 24px from 640px.

## Languages

Pages that exist in more than one language show a language switcher in the header: one link per other language (`.lang-switch`, 44px, label `EN`, `DE` or `ع`) to the same page in that language, never a dropdown or a script. Below 640px the header has no room for them, so the languages are listed in the mobile menu instead. Content that is only available in English keeps `lang="en"` on its container so screen readers switch voice.

**Arabic (right-to-left).** `/ar/` pages set `dir="rtl"`; the layout mirrors through logical properties, and arrows in links flip with `[dir="rtl"]`. Neither Bricolage Grotesque nor IBM Plex Sans has Arabic glyphs, so `:lang(ar)` in `tokens.css` puts **IBM Plex Sans Arabic** first in both `--font-display` and `--font-body` (loaded only on Arabic pages). Never letter-space Arabic text (it breaks the joining) and never set it in the mono face: Arabic eyebrows use the body face without tracking.

## Breakpoints

Media queries cannot read custom properties, so use these three literally and only these:

| Name | Min width | Typical change |
|---|---|---|
| tablet | 640px | 2-column grids, larger padding, row footer |
| desktop | 1024px | inline header replaces the menu button, 3-column grids |
| wide | 1280px | reserved for extra-wide layouts; content still caps at 1200px |

Verify every layout at 320, 375, 768, 1024 and 1440px. There must be no horizontal scroll at any of them.

## Components (`css/site.css`)

- **Header**: sticky, 60px (`--header-h`), blurred `--paper`. Brand left, inline nav from 1024px, theme toggle, menu button below 1024px. The nav list comes from `_data/site.json` (`siteNav`).
- **Mobile menu**: full-screen sheet (`.menu-sheet`), 52px rows, closes on link click, the close button and Escape; focus moves in and returns. Wired by `js/site-nav.js` through `[data-menu-open]`, `[data-menu]`, `[data-menu-close]`.
- **Buttons** (`.btn`): 44px minimum height, 10px radius. `.btn-primary` is `--signal` with `--on-signal` text; `.btn-secondary` is `--card` with a `--rule-strong` border. One primary action per view.
- **Cards**: `--card`, `--rule` border, 14px radius, `--lift`. Whole-card links must still have a real title link inside.
- **Tags and chips**: pills; `.tag` accent, `.tag-ok` for success; King Studio status chips (`.ks-status-*`) pair a dot shape with text so colour is never the only signal.
- **Forms** (`.field`): label above, 44px inputs, 2px `--signal` focus outline, errors in `--signal-wash` with text.
- **Footer**: hairline top border, links with 40px tap height, copyright year filled by `js/site-nav.js`.
- **Cookie banner**: a card pinned bottom with 12px margin, 44px buttons.

## Icons

Prefer inline SVG (`aria-hidden="true"`, `focusable="false"`) for anything essential: menu, close, theme, crown. Font Awesome 6.4 is still loaded (non-blocking) by the shared shell (`base.njk`) and a few pages; do not make meaning depend on it, and do not add another version.

## Motion

State feedback only: roughly 150ms on hover and focus, 200ms card lift. No entrance animations, parallax or autoplay. Everything is disabled under `prefers-reduced-motion: reduce`.

## Accessibility checklist

- Contrast 4.5:1 for text, 3:1 for UI.
- One `h1` per page; headings never skip a level (catalogue card titles are `h2` under the page `h1`, `h3` inside homepage sections).
- Every interactive element reachable by keyboard with a visible focus ring; a "Skip to main content" link first.
- Touch targets at least 44px (links inside running text and card title links are the only smaller ones, and each has a 44px sibling action).
- Informative images have `alt`; decorative ones have `alt=""` or `aria-hidden`.
- Dialogs have a name, trap nothing, close on Escape, and restore focus.
- Closed dialogs use `visibility: hidden` so their controls leave the tab order.
- Do not rely on hover; touch screens have none (the blog "Copy" button is always visible for this reason).

## Do and don't

| Do | Don't |
|---|---|
| Use `var(--...)` tokens | Paste hex values or px sizes into a page |
| Build the phone layout first | Hide navigation below 1024px without a working menu |
| Use real data and real screenshots | Invent counts, reviews or "coming soon" products |
| Reuse `.btn`, `.card`, `.tag`, `.field` | Restyle the same control per page |
| Keep one accent (`--signal`, `--ks-accent` on King Studio) | Add a second accent colour |
| Test at 320 and 1440px in a browser | Trust a green build for a layout change |

## Where it lives

`css/tokens.css` (values) · `css/site.css` (shared shell and components) · `css/home.css` (homepage sections and settings dialog; the project cards reuse `css/king-studio.css`) · `css/king-studio.css` (King Studio) · `css/downloads.css`, `css/blog-post.css` (page-specific) · `_includes/partials/site-head|header|footer.njk` (shared markup) · `js/site-nav.js` (menu, theme, year).

## Known debt

- There is no Impressum (legal notice) page yet. A German-facing site offering services probably needs one; it needs the owner's name and postal address, which are not in the repository.
- `css/style.css` (legacy, minified, conflicting `:root` blocks) is still used by `devos.html`, `vault/*`, `quran.html`-style standalone pages and a few others. Those pages are not yet on this system. Migrate them to `tokens.css` + `site.css` rather than adding to `style.css`.
