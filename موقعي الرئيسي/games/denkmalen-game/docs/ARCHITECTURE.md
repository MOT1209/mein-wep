# Architecture Documentation

## 🏗️ System Overview

Denkmalen is a Next.js 14 application using App Router, Zustand for state management, and a plugin-based architecture for extensibility.

## 🎯 Core Principles

1. **Offline-First**: Works without internet connection
2. **Plugin-Based**: Core is stable, features are plugins
3. **Mobile-First**: Responsive design for all devices
4. **Performance**: Lazy loading, code splitting, optimized bundles
5. **Accessibility**: ARIA labels, keyboard navigation, screen reader support

## 📊 High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         Client (Browser)                         │
├─────────────────────────────────────────────────────────────────┤
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐            │
│  │   Next.js   │  │   Zustand   │  │   Plugins   │            │
│  │   App Router│  │   Store     │  │   System    │            │
│  └─────────────┘  └─────────────┘  └─────────────┘            │
│         │                │                │                      │
│         └────────────────┼────────────────┘                      │
│                          │                                       │
│  ┌───────────────────────┴───────────────────────┐              │
│  │              Game Provider                     │              │
│  │  - State management                           │              │
│  │  - Sound effects                              │              │
│  │  - Vibration                                  │              │
│  │  - Offline storage                            │              │
│  └───────────────────────────────────────────────┘              │
│                          │                                       │
│  ┌───────────────────────┴───────────────────────┐              │
│  │              Phase Router                      │              │
│  │  menu → setup → drawing → voting → results    │              │
│  └───────────────────────────────────────────────┘              │
├─────────────────────────────────────────────────────────────────┤
│                         Server (API)                             │
├─────────────────────────────────────────────────────────────────┤
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐            │
│  │   Gemini    │  │  Supabase   │  │   Socket    │            │
│  │   AI API    │  │  Database   │  │  .IO        │            │
│  └─────────────┘  └─────────────┘  └─────────────┘            │
└─────────────────────────────────────────────────────────────────┘
```

## 🔄 Game Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                        Game Lifecycle                            │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌──────┐    ┌────────┐    ┌─────────┐    ┌────────┐          │
│  │ Menu │───▶│ Setup  │───▶│ Drawing │───▶│ Voting │          │
│  └──────┘    └────────┘    └─────────┘    └────────┘          │
│                               │                │                 │
│                               │                │                 │
│                               ▼                ▼                 │
│                        ┌─────────┐    ┌────────────┐            │
│                        │  AI     │    │   Results  │            │
│                        │Evaluate │    │   Screen   │            │
│                        └─────────┘    └────────────┘            │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

## 🧩 Plugin System

### Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                     Plugin System Architecture                   │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │                    Plugin Manager                        │    │
│  │  - Registration                                         │    │
│  │  - Lifecycle management                                 │    │
│  │  - Event system                                         │    │
│  │  - Dependency resolution                                │    │
│  └─────────────────────────────────────────────────────────┘    │
│                              │                                   │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │                    Core Events                           │    │
│  │  game:start, game:round:start, game:drawing:save,      │    │
│  │  game:vote:cast, game:score:calculate, game:end        │    │
│  └─────────────────────────────────────────────────────────┘    │
│                              │                                   │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │                    Plugins                               │    │
│  │  ┌─────┐ ┌──────────┐ ┌────────┐ ┌──────────┐        │    │
│  │  │ AI  │ │Challenges│ │ Audio  │ │Statistics│        │    │
│  │  └─────┘ └──────────┘ └────────┘ └──────────┘        │    │
│  │  ┌─────────┐ ┌────────┐ ┌────────┐ ┌──────────┐     │    │
│  │  │Cosmetics│ │Replay  │ │ Teams  │ │Tournaments│     │    │
│  │  └─────────┘ └────────┘ └────────┘ └──────────┘     │    │
│  │  ┌──────────┐ ┌────────┐                              │    │
│  │  │Community │ │Settings│                              │    │
│  │  └──────────┘ └────────┘                              │    │
│  └─────────────────────────────────────────────────────────┘    │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### Plugin Lifecycle

1. **Registration**: Plugin is registered with the manager
2. **Initialization**: `onInit()` is called
3. **Activation**: `onActivate()` is called, event listeners are set up
4. **Running**: Plugin responds to events
5. **Deactivation**: `onDeactivate()` is called, cleanup occurs
6. **Destruction**: `onDestroy()` is called when unregistered

## 📁 State Management

### Zustand Store Structure

```typescript
interface GameState {
  // Game state
  mode: 'offline' | 'online' | null
  phase: GamePhase
  gameType: GameType
  
  // Players
  players: Player[]
  currentPlayer: Player | null
  
  // Drawing
  currentWord: string | null
  currentDrawing: string | null
  drawingHistory: string[]
  
  // Voting
  votes: Vote[]
  aiEvaluations: Record<string, AIEvaluation>
  
  // Settings
  settings: Settings
  stats: GameStats
  
  // Actions
  setMode: (mode: GameMode) => void
  setPhase: (phase: GamePhase) => void
  // ... more actions
}
```

### Persistence

State is persisted to localStorage using Zustand's `persist` middleware:

```typescript
persist(
  (set, get) => ({ /* state */ }),
  {
    name: 'draw-battle-storage',
    partialize: (state) => ({
      settings: state.settings,
      stats: state.stats,
      unlockedItems: state.unlockedItems,
    }),
  }
)
```

## 🎨 Component Hierarchy

```
RootLayout
├── ThemeProvider
│   ├── AuthProvider
│   │   ├── SocketProvider
│   │   │   ├── GameProvider
│   │   │   │   ├── ServiceWorkerProvider
│   │   │   │   │   └── Page (Phase Router)
│   │   │   │   │       ├── MainMenu
│   │   │   │   │       ├── OfflineSetup
│   │   │   │   │       ├── DrawingScreen
│   │   │   │   │       │   ├── DrawingHeader
│   │   │   │   │       │   ├── DrawingToolbar
│   │   │   │   │       │   ├── DrawingOverlays
│   │   │   │   │       │   └── DrawingModals
│   │   │   │   │       ├── VotingScreen
│   │   │   │   │       ├── ResultsScreen
│   │   │   │   │       ├── Leaderboard
│   │   │   │   │       ├── StatsScreen
│   │   │   │   │       ├── SettingsScreen
│   │   │   │   │       └── PluginManager
```

## 🔌 API Routes

### Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/evaluate` | POST | Evaluate drawing with AI |
| `/api/generate-word` | POST | Generate random word |
| `/api/hints` | POST | Get drawing hints |

### Request/Response Format

```typescript
// POST /api/evaluate
interface EvaluateRequest {
  image: string // Base64 image
  word: string // Target word
}

interface EvaluateResponse {
  score: number // 0-100
  feedback: string // AI feedback
  details: {
    accuracy: number
    creativity: number
    overall: number
  }
}
```

## 📱 Offline Architecture

### Storage Layers

1. **Service Worker Cache**
   - Static assets (HTML, CSS, JS)
   - Images
   
2. **IndexedDB (via idb)**
   - Word lists
   - Game results
   - Player profiles
   
3. **LocalStorage**
   - Settings
   - Stats
   - Cosmetics

### Sync Strategy

- Offline changes are stored locally
- When online, sync with Supabase
- Conflict resolution: Last write wins

## 🔒 Security

### API Security

- Rate limiting on API routes
- Input validation with Zod
- CORS configuration

### Client Security

- No secrets in client code
- CSP headers configured
- XSS protection via React

## 📊 Performance

### Optimization Strategies

1. **Code Splitting**
   - Dynamic imports for all screens
   - Plugin lazy loading
   
2. **Caching**
   - Service Worker for static assets
   - API response caching
   
3. **Bundle Optimization**
   - Tree shaking
   - Package import optimization
   - Console removal in production

### Metrics

- First Contentful Paint: < 1.5s
- Largest Contentful Paint: < 2.5s
- Time to Interactive: < 3s
- Bundle Size: < 200KB (gzipped)

## 🧪 Testing Strategy

### Test Types

1. **Unit Tests**
   - Utility functions
   - Store logic
   
2. **Component Tests**
   - React components
   - User interactions
   
3. **Integration Tests**
   - API routes
   - Plugin system

### Coverage Goals

- Statements: > 70%
- Branches: > 60%
- Functions: > 70%
- Lines: > 70%

## 🚀 Deployment

### Environments

- **Development**: Local (`npm run dev`)
- **Preview**: Vercel (PR previews)
- **Production**: Vercel (main branch)

### CI/CD Pipeline

1. **Lint** → Code quality check
2. **Test** → Run test suite
3. **Build** → Production build
4. **Deploy** → Vercel deployment

## 📚 Further Reading

- [Development Guide](./DEVELOPMENT.md)
- [Performance Guide](./PERFORMANCE.md)
- [CI/CD Documentation](./CI_CD.md)
