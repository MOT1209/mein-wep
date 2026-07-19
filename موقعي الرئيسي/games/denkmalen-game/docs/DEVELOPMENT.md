# Development Guide

This guide covers everything you need to know to develop Denkmalen locally.

## 🚀 Quick Start

### Prerequisites

- **Node.js 20+** (recommended: use nvm)
- **npm or yarn**
- **Git**
- **Gemini API key** (for AI features)

### Setup

```bash
# 1. Clone the repository
git clone https://github.com/MOT1209/mein-wep.git
cd mein-wep/games/denkmalen-game

# 2. Install dependencies
npm install

# 3. Set up environment variables
cp .env.example .env.local
# Edit .env.local with your API keys

# 4. Start development server
npm run dev
```

Visit http://localhost:3000/denkmalen

## 📁 Project Structure

```
denkmalen-game/
├── public/                    # Static assets
│   ├── sw.js                 # Service Worker
│   ├── manifest.json         # PWA manifest
│   └── og.png               # Open Graph image
├── src/
│   ├── app/                  # Next.js App Router
│   │   ├── api/             # API routes
│   │   │   ├── evaluate/    # AI evaluation endpoint
│   │   │   ├── generate-word/ # Word generation
│   │   │   └── hints/       # Drawing hints
│   │   ├── layout.tsx       # Root layout
│   │   ├── page.tsx         # Home page (phase router)
│   │   └── error.tsx        # Error boundary
│   ├── components/           # React components
│   │   ├── drawing/         # Drawing-related components
│   │   │   ├── DrawingHeader.tsx
│   │   │   ├── DrawingToolbar.tsx
│   │   │   ├── DrawingOverlays.tsx
│   │   │   ├── DrawingModals.tsx
│   │   │   └── canvasUtils.ts
│   │   ├── ChallengeBanner.tsx
│   │   ├── PluginManager.tsx
│   │   └── ... (other components)
│   ├── hooks/                # Custom React hooks
│   ├── lib/                  # Utility functions
│   │   ├── analytics.ts     # Event tracking
│   │   ├── gemini.ts        # Gemini AI integration
│   │   ├── i18n.ts         # Internationalization
│   │   ├── offline-storage.ts # Offline data storage
│   │   ├── supabase.ts      # Supabase client
│   │   └── words.ts         # Word lists
│   ├── plugin-system/        # Plugin architecture
│   │   ├── types.ts         # Plugin types
│   │   ├── base.ts          # Plugin factory
│   │   └── manager.ts       # Plugin manager
│   ├── plugins/              # Plugin implementations
│   │   ├── ai/              # AI evaluation
│   │   ├── audio/           # Sound effects
│   │   ├── challenges/      # Game challenges
│   │   ├── community/       # Friends & profiles
│   │   ├── cosmetics/       # Avatars & frames
│   │   ├── replay/          # Drawing replay
│   │   ├── settings/        # App settings
│   │   ├── statistics/      # Player stats
│   │   ├── teams/           # Team mode
│   │   └── tournaments/     # Competitions
│   └── store/                # Zustand state
│       └── gameStore.ts     # Game state
├── scripts/                  # Build scripts
│   ├── analyze-bundle.mjs   # Bundle analyzer
│   ├── generate-og-png.mjs  # OG image generator
│   └── optimize-images.mjs  # Image optimizer
├── docs/                     # Documentation
├── .agents/                  # AI agent system
├── .github/                  # GitHub Actions
└── sentry.*.config.ts       # Sentry configuration
```

## 🛠️ Development Commands

```bash
# Development
npm run dev              # Start dev server
npm run dev -- --turbo  # Start with Turbopack

# Build
npm run build            # Production build
npm run build:analyze    # Build with bundle analysis

# Testing
npm test                 # Run tests
npm run test:watch       # Watch mode
npm run test:coverage    # With coverage
npm run test:ci          # CI mode

# Linting
npm run lint             # Run ESLint
npm run lint:fix         # Auto-fix issues

# Type Checking
npm run type-check       # TypeScript check

# Analysis
npm run analyze          # Analyze bundle size
npm run optimize:images  # Optimize images
npm run optimize:all     # Optimize all assets
```

## 🎨 Component Architecture

### Phase-Based Rendering

The app uses a phase-based architecture where `gameStore.phase` determines which screen to render:

```typescript
// src/app/page.tsx
const renderPhase = () => {
  switch (phase) {
    case 'menu': return <MainMenu />
    case 'setup': return <OfflineSetup />
    case 'drawing': return <DrawingScreen />
    // ... etc
  }
}
```

### Dynamic Imports

All screens are lazy-loaded for optimal performance:

```typescript
const DrawingScreen = dynamic(
  () => import('@/components/DrawingScreen'),
  { loading: () => <LoadingSpinner />, ssr: false }
)
```

### Plugin System

Plugins extend game functionality without modifying core code:

```typescript
// Creating a plugin
const myPlugin = createPlugin<MyConfig>(
  {
    id: 'my-plugin',
    name: 'My Plugin',
    version: '1.0.0',
    description: 'Does something cool',
    author: 'Your Name',
  },
  (ctx, config) => ({
    onInit: () => { /* initialization */ },
    onActivate: () => {
      ctx.on('game:start', handleGameStart)
    },
    onDeactivate: () => {
      ctx.off('game:start', handleGameStart)
    },
  })
)
```

## 🧪 Testing

### Writing Tests

```typescript
// src/__tests__/MyComponent.test.tsx
import { render, screen, fireEvent } from '@testing-library/react'
import { MyComponent } from '@/components/MyComponent'

describe('MyComponent', () => {
  it('renders correctly', () => {
    render(<MyComponent />)
    expect(screen.getByText('Hello')).toBeInTheDocument()
  })

  it('handles click events', () => {
    const handleClick = jest.fn()
    render(<MyComponent onClick={handleClick} />)
    fireEvent.click(screen.getByRole('button'))
    expect(handleClick).toHaveBeenCalled()
  })
})
```

### Test Structure

- `src/__tests__/` - Component tests
- `*.test.tsx` - Component tests
- `*.test.ts` - Utility tests

## 🌍 Internationalization

### Adding Translations

```typescript
// src/lib/i18n.ts
const translations = {
  'my.key': {
    en: 'English text',
    ar: 'النص العربي',
    de: 'Deutscher Text',
  },
}
```

### Using Translations

```typescript
import { t } from '@/lib/i18n'

const text = t('my.key', settings.language)
```

## 📱 PWA & Offline

### Service Worker

The service worker (`public/sw.js`) caches static assets for offline use.

### Offline Storage

Use the offline storage module for persisting data:

```typescript
import { saveOfflineSettings, getOfflineSettings } from '@/lib/offline-storage'

// Save settings
saveOfflineSettings({ language: 'ar', theme: 'dark' })

// Load settings
const settings = getOfflineSettings()
```

## 🔧 Configuration

### Environment Variables

```env
# Required
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_key
GEMINI_API_KEY=your_gemini_key

# Optional
NEXT_PUBLIC_SENTRY_DSN=your_sentry_dsn
NEXT_PUBLIC_SOCKET_URL=your_socket_url
```

### Feature Flags

Control features via `src/lib/flags.ts`:

```typescript
export const FEATURES = {
  onlineMode: true,
  leaderboard: true,
  statistics: true,
  demoVideo: false,
}
```

## 🐛 Debugging

### Common Issues

1. **Build fails**: Run `npm run type-check` to find TypeScript errors
2. **Tests fail**: Check mock setup in `jest.setup.js`
3. **SW not updating**: Clear cache or use incognito mode

### Debug Tools

- React DevTools
- Zustand DevTools (in development)
- Browser DevTools Application tab (for SW/Storage)

## 📚 Additional Resources

- [Architecture Documentation](./ARCHITECTURE.md)
- [Performance Guide](./PERFORMANCE.md)
- [CI/CD Documentation](./CI_CD.md)
- [Plugin System](../src/plugin-system/README.md)
