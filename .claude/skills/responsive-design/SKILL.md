---
name: responsive-design
description: Mobile-first responsive design — breakpoints, fluid typography, flexible layouts
triggers:
  - responsive design
  - mobile-first
  - breakpoints
  - fluid typography
  - flexible layout
  - adaptive design
---

# Responsive Design Skill

## Overview
Mobile-first responsive design for Rashid's portfolio across all devices.

## Breakpoints
```css
/* Mobile-first approach */
:root {
  --breakpoint-sm: 640px;
  --breakpoint-md: 768px;
  --breakpoint-lg: 1024px;
  --breakpoint-xl: 1280px;
  --breakpoint-2xl: 1536px;
}

/* Base styles: mobile */
.container {
  width: 100%;
  padding: 0 1rem;
}

/* Tablet */
@media (min-width: 768px) {
  .container {
    max-width: 720px;
    margin: 0 auto;
    padding: 0 2rem;
  }
}

/* Desktop */
@media (min-width: 1024px) {
  .container {
    max-width: 960px;
  }
}

/* Large desktop */
@media (min-width: 1280px) {
  .container {
    max-width: 1200px;
  }
}
```

## Fluid Typography
```css
:root {
  /* Fluid font sizes: clamp(min, preferred, max) */
  --text-xs: clamp(0.75rem, 0.7rem + 0.25vw, 0.875rem);
  --text-sm: clamp(0.875rem, 0.8rem + 0.35vw, 1rem);
  --text-base: clamp(1rem, 0.9rem + 0.5vw, 1.125rem);
  --text-lg: clamp(1.125rem, 1rem + 0.6vw, 1.25rem);
  --text-xl: clamp(1.25rem, 1.1rem + 0.75vw, 1.5rem);
  --text-2xl: clamp(1.5rem, 1.2rem + 1.5vw, 2rem);
  --text-3xl: clamp(1.875rem, 1.4rem + 2.4vw, 2.5rem);
  --text-4xl: clamp(2.25rem, 1.5rem + 3.75vw, 3.5rem);
}
```

## Flexible Grid System
```css
/* CSS Grid */
.grid {
  display: grid;
  gap: 1.5rem;
  grid-template-columns: 1fr;
}

@media (min-width: 640px) {
  .grid { grid-template-columns: repeat(2, 1fr); }
}

@media (min-width: 1024px) {
  .grid { grid-template-columns: repeat(3, 1fr); }
}

/* Flexbox */
.flex {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

@media (min-width: 768px) {
  .flex { flex-direction: row; }
}
```

## Responsive Components

### Navigation
```css
/* Mobile: hamburger menu */
.nav-menu {
  display: none;
  position: fixed;
  top: 60px;
  left: 0;
  right: 0;
  background: var(--bg-base);
  padding: 1rem;
}

.nav-menu.active { display: block; }

/* Desktop: horizontal menu */
@media (min-width: 768px) {
  .nav-menu {
    display: flex;
    position: static;
    background: none;
    padding: 0;
    gap: 2rem;
  }
}
```

### Cards
```css
.card {
  width: 100%;
  padding: 1.5rem;
  border-radius: var(--radius-md);
}

@media (min-width: 640px) {
  .card { max-width: 50%; }
}

@media (min-width: 1024px) {
  .card { max-width: 33.333%; }
}
```

## Responsive Images
```html
<img 
  srcset="
    image-400w.webp 400w,
    image-800w.webp 800w,
    image-1200w.webp 1200w
  "
  sizes="(max-width: 600px) 400px,
         (max-width: 1200px) 800px,
         1200px"
  src="image-800w.webp"
  alt="Description"
  loading="lazy"
  width="800"
  height="600"
>
```

## Testing Devices
- iPhone SE (375px)
- iPhone 14 (390px)
- iPad (768px)
- iPad Pro (1024px)
- Laptop (1366px)
- Desktop (1920px)

## Rules
- Mobile-first: base styles for mobile, enhance for larger screens
- Touch targets: minimum 44px x 44px
- Spacing: use rem/em, not px
- Images: responsive with srcset
- Text: fluid typography with clamp()
- Navigation: hamburger on mobile, horizontal on desktop
- Forms: full-width inputs on mobile
- Test on real devices, not just browser resize
