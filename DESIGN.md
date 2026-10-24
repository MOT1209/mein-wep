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
| `--paper` | `#fafafb` | `#0c0e12` | Page ground |
| `--card` | `#ffffff` | `#14171d` | Raised surfaces |
| `--card-sunk` | `#f4f5f7` | `#1a1e25` | Inset wells, code, hover rows |
| `--rule` | `#e4e7ec` | `#252a33` | Hairlines |
| `--rule-strong` | `#ced3da` | `#333a45` | Dividers that carry weight, input borders |
| `--ink` | `#12161c` | `#eef1f5` | Headings, primary text |
| `--ink-soft` | `#384250` | `#c4ccd6` | Body text on long pages |
| `--ink-muted` | `#5a6472` | `#929cab` | Supporting copy |
| `--ink-faint` | `#68727f` | `#828c99` | Metadata, eyebrows (4.68:1 light, 5.67:1 dark) |
| `--signal` | `#c2410c` | `#fb7a4a` | The one accent: links, primary buttons, active states |
| `--signal-hover` | `#9a3412` | `#fd9a73` | Accent hover |
| `--on-signal` | `#ffffff` | `#111111` | Text on `--signal` |
| `--signal-wash` / `--signal-edge` | `#fff4ed` / `#fbd5bd` | `#24160f` / `#4a2a1a` | Accent chips, active nav |
| `--ok` / `--ok-wash` | `#15803d` / `#eefbf2` | `#4ade80` / `#10231a` | Status only, never decoration |

Rules: text on `--paper` must be `--ink`, `--ink-soft` or `--ink-muted`; use `--ink-faint` only for non-essential metadata. `--ok` encodes "available / success" and nothing else.

### King Studio brand layer (`css/king-studio.css`)

King Studio keeps its own identity on top of the same tokens: a fixed charcoal frame (header and hero) with a restrained gold accent.

| Token | Value | Use |
|---|---|---|
| `--ks-charcoal` | `#151515` | Header, hero, active filter chip (both themes) |
| `--ks-gold` | `#d9b56d` | Accent on charcoal; focus ring; primary hero button |
| `--ks-gold-ink` | `#7a5a14` light, `#d9b56d` dark | Gold used as **text** on themed surfaces |
| `--ks-gold-wash` / `--ks-gold-edge` | `#fbf3e2` / `#e7d3a4` light, `#221d11` / `#4a3d1c` dark | "In development" and "Experimental" chips |

Gold text on a light surface fails contrast, so use `--ks-gold-ink` there. Wordmark: `KING STUDIO` in the display font, letter-spaced, with an inline SVG crown. Tagline: "Build. Create. Innovate."

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
| Keep one accent (`--signal`, or gold on King Studio) | Add a second accent colour |
| Test at 320 and 1440px in a browser | Trust a green build for a layout change |

## Where it lives

`css/tokens.css` (values) · `css/site.css` (shared shell and components) · `css/home.css` (homepage sections and settings dialog; the project cards reuse `css/king-studio.css`) · `css/king-studio.css` (King Studio) · `css/downloads.css`, `css/blog-post.css` (page-specific) · `_includes/partials/site-head|header|footer.njk` (shared markup) · `js/site-nav.js` (menu, theme, year).

## Known debt

- `css/style.css` (legacy, minified, conflicting `:root` blocks) is still used by `devos.html`, `vault/*`, `quran.html`-style standalone pages and a few others. Those pages are not yet on this system. Migrate them to `tokens.css` + `site.css` rather than adding to `style.css`.
- `apps/calculator-app/icons/*.png` and `apps/quiz-app/icons/*.png` are corrupt (the IHDR chunk length is 17, not 13), so browsers cannot decode them. The King Studio catalogue uses each app's valid `icon.svg` instead. The PNGs, which those apps' manifests may still reference, need regenerating as part of work on those apps.
