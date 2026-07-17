# KING2 Design System

This project uses a dark-first "royal command center" visual system. Interfaces should feel like a powerful AI control surface: dramatic, precise, highly usable, and RTL-first.

---

## Stack

- **Framework:** Next.js App Router + React + TypeScript
- **Styling:** Tailwind CSS v3 (upgrading to v4 planned)
- **Components:** Custom KING2 components in `components/ui/`
- **Icons:** Lucide React (via shadcn/ui)
- **Fonts:** Inter for UI, Noto Sans Arabic for Arabic text, JetBrains Mono for code
- **Dark mode:** Forced dark via `next-themes` (class-based)
- **RTL:** `dir="rtl"` on `<html>`, `lang="ar"`
- **Utilities:** `cn()` from `tailwind-merge` + `clsx`

---

## Visual Direction

The app is a living AI command center, not a generic chatbot.

- Use deep indigo/navy backgrounds, warm gold accents, emerald highlights, and glassy surfaces.
- Use glass panels over a dark gradient background with subtle radial glows.
- Prefer large display headings with tight tracking for Arabic.
- Make controls feel tactile: rounded corners, inner shadows, subtle lift on hover, visible focus rings.

---

## Color Tokens — CSS Custom Properties

Defined in `app/globals.css` as CSS variables, bridged to Tailwind via `tailwind.config.js`.

| Token | Tailwind Class | Value | Usage |
|---|---|---|---|
| `--color-surface-primary` | `bg-surface-primary` | `#0a0a0f` | Page canvas |
| `--color-surface-secondary` | `bg-surface-secondary` | `#111118` | Cards/panels |
| `--color-surface-tertiary` | `bg-surface-tertiary` | `#1a1a24` | Inputs/surfaces |
| `--color-surface-elevated` | `bg-surface-elevated` | `#222230` | Hover/dropdowns |
| `--king-500` | `bg-king-500` | `#6366f1` | Primary actions |
| `--king-600` | `bg-king-600` | `#4f46e5` | Button/surface |
| `--accent-gold` | `text-accent-gold` | `#d4a574` | Premium accents |
| `--accent-emerald` | `text-accent-emerald` | `#10b981` | Success/online |
| `--color-text-primary` | `text-white` | `#ffffff` | Primary text |
| `--color-text-secondary` | `text-zinc-400` | `#a1a1aa` | Secondary/copy |
| `--color-text-muted` | `text-zinc-600` | `#71717a` | Muted/supporting |

---

## Typography

| Token | Font | Usage |
|---|---|---|
| `--font-inter` | Inter | UI text, labels, buttons |
| `--font-arabic` | Noto Sans Arabic | Arabic body text, inputs |
| `font-mono` | JetBrains Mono | Code, technical labels, model names |

Guidelines:
- Arabic text uses `font-arabic` with proper line-height (`leading-8` for body)
- Headings use tight tracking and bold weight
- Technical labels use `.king-badge` pattern (mono-adjacent)
- Body copy: `text-sm sm:text-base leading-7`

---

## Core CSS Utilities

Defined in `app/globals.css`:

- `.glass`: Translucent panel with backdrop blur and subtle border
- `.king-card`: Default card with dark surface, rounded-2xl, border
- `.king-btn-primary`: Gradient button from king-600 to king-700
- `.king-btn-secondary`: Outlined button with subtle surface
- `.king-input`: Dark input with focus ring in king-500
- `.king-badge-*`: Pills for status (success, warning, error, info)
- `.pulse-indicator`: Live pulsing dot for AI status
- `.chat-message-user/ai`: Chat bubble styles
- `.text-gradient`: Gradient text effect (king-400 to king-600)
- `.glow-gold / .glow-purple`: Box shadow glows

---

## Components

### Cards
Dark, rounded, glass-like with hover effects:
```tsx
<div className="king-card hover:border-king-600/30 hover:shadow-lg hover:shadow-king-900/20">
```
Avoid plain white/gray cards. Nested items use `bg-surface-tertiary`.

### Buttons
- **Primary**: Gradient `king-btn-primary`, pill radius, bold, hover lift
- **Secondary**: `king-btn-secondary` with border, translucent
- **Ghost**: `king-btn-ghost`, minimal, shows on hover

### Inputs
Dark backgrounds, rounded-xl, inner border, teal/indigo focus ring:
```tsx
<input className="king-input" />
```

### Badges
Rounded-full pills for status:
- `.king-badge-success` — emerald, for online/active
- `.king-badge-warning` — amber, for busy/pending
- `.king-badge-error` — red, for errors/offline
- `.king-badge-info` — blue, for info

### Chat Bubbles
- User: `chat-message chat-message-user` (king-600 background)
- AI: `chat-message chat-message-ai` (tertiary surface)

---

## Layout

Use a full-height app shell with optional sidebar:
```tsx
<div className="flex h-screen bg-surface-primary overflow-hidden">
  <Sidebar />
  <div className="flex flex-col flex-1 overflow-hidden">
    <Header />
    <main className="flex-1 overflow-auto">{children}</main>
  </div>
</div>
```

- Max content width: `max-w-6xl` for chat, `max-w-4xl` for content pages
- Padding: `px-4 sm:px-6`
- Mobile: single column, no sticky sidebar

---

## Interaction Patterns

- **Hover lift**: `hover:active:scale-[0.98]` on buttons
- **Focus**: `focus:outline-none focus:ring-2 focus:ring-king-500/20`
- **Disabled**: `opacity-50 cursor-not-allowed`
- **Loading**: Spinning border animation (see `ChatSkeleton`)
- **Page entrance**: Keep subtle, avoid decorative loops

---

## Accessibility

- Preserve visible focus rings on all interactive controls (`focus-visible`)
- Keep text contrast high on dark surfaces (minimum 4.5:1)
- Arabic text must use proper font stack with fallbacks
- All icons must have `aria-label` or accessible labels
- Controls must remain usable on mobile, especially touch targets (min 44px)

---

## RTL Notes

- `dir="rtl"` on `<html>`, CSS uses logical properties where possible
- SVG icons that imply direction (arrow, chevron) use `rotate-180` in RTL
- Text alignment: `text-right` default, `text-left` for opposite
- Margins/padding: use `gap-*` and flexbox instead of `ml-*`/`mr-*`
