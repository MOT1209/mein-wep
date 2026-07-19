# Performance Optimization Guide

## 🎯 Goals

| Metric | Current | Target |
|--------|---------|--------|
| Bundle Size (JS) | ~350KB | <200KB |
| First Contentful Paint | ~2s | <1.5s |
| Largest Contentful Paint | ~3s | <2.5s |
| Time to Interactive | ~4s | <3s |

## 📊 Optimizations Applied

### 1. Dynamic Imports (Code Splitting)

**File:** `src/app/page.tsx`

All game screens are now lazy-loaded:
- `MainMenu`
- `OfflineSetup`
- `OnlineLobby`
- `DrawingScreen`
- `VotingScreen`
- `ResultsScreen`
- `Leaderboard`
- `StatsScreen`
- `SettingsScreen`

**Impact:** Only the main menu loads initially. Other screens load on demand.

### 2. Provider Optimization

**File:** `src/app/layout.tsx`

Client-side providers are now dynamically imported with `ssr: false`:
- `ThemeProvider`
- `AuthProvider`
- `SocketProvider`
- `GameProvider`
- `ServiceWorkerProvider`

**Impact:** Reduces initial bundle size by deferring client-only code.

### 3. Package Import Optimization

**File:** `next.config.js`

```js
experimental: {
  optimizePackageImports: [
    'framer-motion',
    'react-icons',
  ],
}
```

**Impact:** Tree-shakes unused exports from heavy packages.

### 4. Console Removal in Production

**File:** `next.config.js`

```js
compiler: {
  removeConsole: process.env.NODE_ENV === 'production' ? {
    exclude: ['error', 'warn'],
  } : false,
}
```

**Impact:** Removes debug console.log statements from production builds.

### 5. Browserslist Configuration

**File:** `package.json`

```json
"browserslist": {
  "production": [">0.2%", "not dead", "not op_mini all"],
  "development": ["last 1 chrome version", "last 1 firefox version", "last 1 safari version"]
}
```

**Impact:** Enables better tree-shaking by targeting modern browsers.

### 6. Image Optimization Configuration

**File:** `next.config.js`

```js
images: {
  unoptimized: true, // Static export
  formats: ['image/avif', 'image/webp'],
  deviceSizes: [640, 750, 828, 1080, 1200, 1920],
  imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
  remotePatterns: [
    {
      protocol: 'https',
      hostname: 'rashid-wep.vercel.app',
    },
  ],
}
```

**Impact:** Configured for future image optimization when not using static export.

### 7. SVG Optimization

**Script:** `scripts/optimize-images.mjs`

- Removes comments, metadata, and unnecessary whitespace from SVGs
- Reduces file size without affecting quality

### 8. Responsive OG Images

**Script:** `scripts/generate-responsive-og.mjs`

- Generates multiple sizes for different platforms
- Standard OG (1200x630)
- Twitter Card (1200x628)
- Facebook (1200x630)
- LinkedIn (1200x627)
- Favicon sizes (16x16 to 180x180)

## 🔧 Available Scripts

```bash
# Analyze bundle size
npm run analyze

# Build with ANALYZE flag
npm run build:analyze

# Full analysis (build + analyze)
npm run analyze:build

# Lint with auto-fix
npm run lint:fix

# Type checking
npm run type-check
```

## 📈 Bundle Analysis

Run `npm run analyze` to see:

1. **JavaScript files** - Size and gzip size for each chunk
2. **CSS files** - Total styles size
3. **Performance budget** - Check against 200KB JS threshold

### Sample Output

```
📦 JavaScript Files:
────────────────────────────────────────────────────────────
main.js                                    45.23 KB → 14.56 KB (gzip)
MainMenu.js                               12.34 KB → 4.12 KB (gzip)
DrawingScreen.js                          28.67 KB → 9.23 KB (gzip)

📊 Summary:
────────────────────────────────────────────────────────────
Total files: 25
JavaScript: 15 files, 156.78 KB
CSS: 3 files, 12.34 KB
Other: 7 files, 45.67 KB
────────────────────────────────────────────────────────────
Total size: 214.79 KB
Total gzipped: 68.92 KB
════════════════════════════════════════════════════════════

🎯 Performance Budget:
────────────────────────────────────────────────────────────
✅ JS bundle within 200KB threshold (156.78 KB)
✅ Total bundle within 300KB threshold (214.79 KB)
════════════════════════════════════════════════════════════
```

## 🚀 Further Optimizations

### Pending (Phase 4.2)

1. **Image Optimization**
   - Enable `unoptimized: false` in next.config.js
   - Add modern formats (AVIF, WebP)
   - Configure responsive breakpoints

### Future Optimizations

1. **Prefetching**
   - Add `<Link prefetch>` for likely navigation targets
   - Use `router.prefetch()` for route preloading

2. **Service Worker Caching**
   - Cache-first for static assets
   - Network-first for API calls
   - Offline fallback for navigation

3. **Font Optimization**
   - Use `next/font` with `display: 'swap'`
   - Subset fonts for Arabic/Latin

4. **Third-Party Scripts**
   - Delay non-critical scripts
   - Use `next/script` with `strategy="lazyOnload"`

## 📝 Checklist

- [x] Dynamic imports for all game screens
- [x] Provider optimization (ssr: false)
- [x] Package import optimization
- [x] Console removal in production
- [x] Browserslist configuration
- [x] Bundle analysis script
- [x] Image optimization configuration
- [x] SVG optimization script
- [x] Responsive OG images
- [x] Favicon generation
- [ ] Prefetching strategy
- [ ] Font subsetting
- [ ] Third-party script optimization
