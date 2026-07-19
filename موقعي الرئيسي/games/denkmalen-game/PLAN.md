# 🗺️ Denkmalen — خطة التطوير الشاملة

**تاريخ البدء:** 2026-07-17  
**الحالة:** قيد التنفيذ  
**الهدف:** تحويل Denkmalen من مشروع يعمل إلى مشروع احترافي جاهز للإنتاج

---

## 📊 حالة المشروع الحالية

| المقياس | الحالي | الهدف |
|---------|--------|-------|
| تغطية الاختبارات | ~30% | 80% |
| حجم Bundle | ~350KB | <200KB |
| Error Tracking | لا يوجد | Sentry |
| CI/CD | لا يوجد | GitHub Actions |
| PWA | جزئي | كامل |
| Plugin System | 1/10 | 5/10 |

---

## 🎯 المرحلة 1: الأساسيات الحرجة (أسبوع 1)

### ✅ 1.1 إضافة Error Tracking (Sentry) - مكتمل

**المشكلة:** الأخطاء تختفي بدون أثر، لا يمكنك معرفة ما يحدث في الإنتاج.

**الملفات المتأثرة:**
```
src/app/layout.tsx          — إضافة Sentry provider
src/app/error.tsx           — صفحة خطأ عامة
src/lib/sentry.ts           — تهيئة Sentry
next.config.js              — إضافة Sentry plugin
package.json                — تثبيت @sentry/nextjs
```

**الخطوات:**

1. تثبيت Sentry:
```bash
npx @sentry/wizard@latest -i nextjs
```

2. إنشاء ملف `.env.local`:
```env
NEXT_PUBLIC_SENTRY_DSN=https://your-dsn@sentry.io/project-id
SENTRY_AUTH_TOKEN=your-token
```

3. تحديث `next.config.js`:
```js
const { withSentryConfig } = require('@sentry/nextjs');

module.exports = withSentryConfig({
  // config الحالي
}, {
  silent: true,
  org: "your-org",
  project: "denkmalen",
});
```

4. إنشاء `src/app/error.tsx`:
```tsx
'use client';

import { useEffect } from 'react';
import * as Sentry from '@sentry/nextjs';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    Sentry.captureException(error);
  }, [error]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 to-secondary-50">
      <div className="text-center p-8 bg-white rounded-2xl shadow-xl max-w-md">
        <div className="text-6xl mb-4">😵</div>
        <h2 className="text-2xl font-bold text-slate-800 mb-2">Oops! Something went wrong</h2>
        <p className="text-slate-600 mb-6">Don't worry, our team has been notified.</p>
        <button
          onClick={reset}
          className="px-6 py-3 bg-primary-500 text-white rounded-xl font-semibold hover:bg-primary-600 transition-colors"
        >
          Try Again
        </button>
      </div>
    </div>
  );
}
```

**الجهد:** 2-3 ساعات  
**المتطلبات:** حساب Sentry مجاني

---

### ✅ 1.2 إصلاح Socket Server URL - مكتمل

**المشكلة:** عنوان السيرفر ثابت في الكود، إذا تغير يجب تعديله يدوياً.

**الحالة:** تم التحقق - الكود الحالي يقرأ من `NEXT_PUBLIC_SOCKET_URL` أولاً ويستخدم العنوان الثابت كبديل فقط.

**الملفات المتأثرة:**
```
src/lib/socket.ts           — قراءة URL من env
src/components/SocketProvider.tsx — استخدام env
.env.local                  — إضافة SOCKET_URL
.env.example                — تحديث
```

**الخطوات:**

1. تحديث `src/lib/socket.ts`:
```ts
const SOCKET_URL = process.env.NEXT_PUBLIC_SOCKET_URL || 
  'wss://denkmalen-server-hntw.onrender.com';

export const getSocket = () => {
  // ... الكود الحالي مع استخدام SOCKET_URL
};
```

2. تحديث `.env.example`:
```env
NEXT_PUBLIC_SOCKET_URL=wss://your-socket-server.com
```

3. تحديث `src/components/SocketProvider.tsx`:
```tsx
const socketUrl = process.env.NEXT_PUBLIC_SOCKET_URL || 
  'wss://denkmalen-server-hntw.onrender.com';

// استخدام socketUrl بدلاً من العنوان الثابت
```

**الجهد:** ساعة واحدة  
**المتطلبات:** لا شيء

---

### ✅ 1.3 إنشاء CI/CD Pipeline - مكتمل

**المشكلة:** لا يوجد اختبار تلقائي قبل الدفع، الأخطاء تصل للإنتاج.

**الملفات المتأثرة:**
```
.github/workflows/ci.yml    — سير العمل الجديد
```

**الخطوات:**

1. إنشاء `.github/workflows/ci.yml`:
```yaml
name: CI/CD Pipeline

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    
    steps:
      - name: Checkout code
        uses: actions/checkout@v4
        
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
          
      - name: Install dependencies
        run: npm ci
        
      - name: Run linter
        run: npm run lint
        
      - name: Run tests
        run: npm test -- --coverage
        
      - name: Build
        run: npm run build
        
      - name: Upload coverage
        uses: codecov/codecov-action@v3
        with:
          file: ./coverage/lcov.info
```

2. إنشاء `.github/workflows/deploy.yml`:
```yaml
name: Deploy to Vercel

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    
    steps:
      - name: Checkout
        uses: actions/checkout@v4
        
      - name: Install Vercel CLI
        run: npm i -g vercel
        
      - name: Pull Vercel environment
        run: vercel pull --yes --environment=production --token=${{ secrets.VERCEL_TOKEN }}
        
      - name: Build
        run: vercel build --prod --token=${{ secrets.VERCEL_TOKEN }}
        
      - name: Deploy to production
        run: vercel deploy --prebuilt --prod --token=${{ secrets.VERCEL_TOKEN }}
```

**الجهد:** 3-4 ساعات  
**المتطلبات:** حساب Vercel + GitHub Secrets

---

## 🎯 المرحلة 2: تغطية الاختبارات (أسبوع 2)

### 2.1 اختبارات المكونات الرئيسية

**الهدف:** رفع التغطية من 30% إلى 60%

**الملفات المتأثرة:**
```
src/__tests__/DrawingScreen.test.tsx     — جديد
src/__tests__/VotingScreen.test.tsx      — جديد
src/__tests__/ResultsScreen.test.tsx     — جديد
src/__tests__/MainMenu.test.tsx          — جديد
src/__tests__/OnlineLobby.test.tsx       — جديد
src/__tests__/OfflineSetup.test.tsx      — جديد
src/__tests__/SettingsScreen.test.tsx    — جديد
```

**مثال اختبار MainMenu:**
```tsx
import { render, screen, fireEvent } from '@testing-library/react';
import { MainMenu } from '@/components/MainMenu';
import { useGameStore } from '@/store/gameStore';

// Mock the store
jest.mock('@/store/gameStore');
const mockUseGameStore = useGameStore as jest.Mock;

describe('MainMenu', () => {
  beforeEach(() => {
    mockUseGameStore.mockReturnValue({
      startOfflineGame: jest.fn(),
      language: 'en',
    });
  });

  it('renders game title', () => {
    render(<MainMenu />);
    expect(screen.getByText(/Denkmalen/)).toBeInTheDocument();
  });

  it('calls startOfflineGame when Play Now clicked', () => {
    const mockStart = jest.fn();
    mockUseGameStore.mockReturnValue({
      startOfflineGame: mockStart,
      language: 'en',
    });
    
    render(<MainMenu />);
    fireEvent.click(screen.getByText(/Play Now/));
    expect(mockStart).toHaveBeenCalled();
  });

  it('shows settings button', () => {
    render(<MainMenu />);
    expect(screen.getByText(/Settings/)).toBeInTheDocument();
  });
});
```

**مثال اختبار VotingScreen:**
```tsx
import { render, screen, fireEvent } from '@testing-library/react';
import { VotingScreen } from '@/components/VotingScreen';

const mockPlayers = [
  { id: '1', name: 'Player 1', avatar: '😀', score: 0, drawings: [] },
  { id: '2', name: 'Player 2', avatar: '😎', score: 0, drawings: [] },
];

const mockDrawings = [
  { playerId: '1', word: 'cat', dataUrl: 'data:image/png;base64,...' },
  { playerId: '2', word: 'cat', dataUrl: 'data:image/png;base64,...' },
];

describe('VotingScreen', () => {
  it('shows drawings for voting', () => {
    render(
      <VotingScreen
        players={mockPlayers}
        drawings={mockDrawings}
        onVote={jest.fn()}
      />
    );
    
    expect(screen.getByText(/Player 1/)).toBeInTheDocument();
    expect(screen.getByText(/Player 2/)).toBeInTheDocument();
  });

  it('calls onVote when vote button clicked', () => {
    const mockVote = jest.fn();
    render(
      <VotingScreen
        players={mockPlayers}
        drawings={mockDrawings}
        onVote={mockVote}
      />
    );
    
    const voteButtons = screen.getAllByText(/Vote/);
    fireEvent.click(voteButtons[0]);
    expect(mockVote).toHaveBeenCalledWith('1');
  });
});
```

**الجهد:** 8-10 ساعات  
**المتطلبات:** فهم المكونات الحالية

---

### 2.2 اختبارات API Routes

**الملفات المتأثرة:**
```
src/__tests__/api/evaluate.test.ts        — جديد
src/__tests__/api/generate-word.test.ts   — جديد
src/__tests__/api/hints.test.ts           — جديد
```

**مثال اختبار /api/evaluate:**
```ts
import { POST } from '@/app/api/evaluate/route';
import { NextRequest } from 'next/server';

// Mock Gemini
jest.mock('@/lib/gemini');
const mockEvaluate = require('@/lib/gemini').evaluateDrawing;

describe('/api/evaluate', () => {
  it('returns evaluation for valid image', async () => {
    mockEvaluate.mockResolvedValue({
      score: 8,
      feedback: 'Great drawing!',
      matched: true,
    });

    const request = new NextRequest('http://localhost/api/evaluate', {
      method: 'POST',
      body: JSON.stringify({
        image: 'data:image/png;base64,...',
        word: 'cat',
        lang: 'en',
      }),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(data.score).toBe(8);
    expect(data.feedback).toBe('Great drawing!');
  });

  it('returns 400 for missing image', async () => {
    const request = new NextRequest('http://localhost/api/evaluate', {
      method: 'POST',
      body: JSON.stringify({ word: 'cat' }),
    });

    const response = await POST(request);
    expect(response.status).toBe(400);
  });
});
```

**الجهد:** 5-6 ساعات  
**المتطلبات:** Mock لـ Gemini API

---

### 2.3 اختبارات Store

**الملفات المتأثرة:**
```
src/__tests__/gameStore.test.ts           — جديد
```

**مثال اختبار GameStore:**
```ts
import { useGameStore } from '@/store/gameStore';

describe('GameStore', () => {
  beforeEach(() => {
    // Reset store before each test
    useGameStore.setState({
      phase: 'menu',
      players: [],
      currentRound: 0,
      language: 'en',
    });
  });

  it('starts offline game', () => {
    const { startOfflineGame } = useGameStore.getState();
    startOfflineGame(['Alice', 'Bob']);
    
    const state = useGameStore.getState();
    expect(state.phase).toBe('setup');
    expect(state.players).toHaveLength(2);
  });

  it('advances to next round', () => {
    const { startOfflineGame, nextRound } = useGameStore.getState();
    startOfflineGame(['Alice', 'Bob']);
    nextRound();
    
    const state = useGameStore.getState();
    expect(state.currentRound).toBe(1);
  });

  it('calculates scores correctly', () => {
    const { calculateScores } = useGameStore.getState();
    const votes = { '1': 3, '2': 1, '3': 2 };
    const scores = calculateScores(votes);
    
    expect(scores['1']).toBe(10); // 1st place
    expect(scores['2']).toBe(5);  // 3rd place
    expect(scores['3']).toBe(7);  // 2nd place
  });
});
```

**الجهد:** 4-5 ساعات  
**المتطلبات:** فهم Store structure

---

## 🎯 المرحلة 3: PWA و Offline (أسبوع 3)

### ✅ 3.1 Service Worker حقيقي - مكتمل

**المشكلة:** `manifest.json` موجود لكن بدون Service Worker يخزن المحتوى.

**الملفات المتأثرة:**
```
public/sw.js                — Service Worker جديد
src/components/ServiceWorkerProvider.tsx — تحديث
src/app/layout.tsx          — تسجيل SW
next.config.js              — تعطيل header قديم
```

**الخطوات:**

1. إنشاء `public/sw.js`:
```js
const CACHE_NAME = 'denkmalen-v1';
const STATIC_ASSETS = [
  '/denkmalen/',
  '/denkmalen/manifest.json',
  '/denkmalen/favicon.svg',
  '/denkmalen/og.png',
];

// تثبيت Service Worker
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(STATIC_ASSETS);
    })
  );
  self.skipWaiting();
});

// تفعيل Service Worker
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => name !== CACHE_NAME)
          .map((name) => caches.delete(name))
      );
    })
  );
  self.clients.claim();
});

// استراتيجية Cache-First for static assets
self.addEventListener('fetch', (event) => {
  const { request } = event;
  
  // تخطي requests غير GET
  if (request.method !== 'GET') return;
  
  // تخطي API calls
  if (request.url.includes('/api/')) return;
  
  event.respondWith(
    caches.match(request).then((cachedResponse) => {
      if (cachedResponse) {
        // إرجاع المخزن وتحديث في الخلفية
        event.waitUntil(
          fetch(request).then((networkResponse) => {
            if (networkResponse.ok) {
              caches.open(CACHE_NAME).then((cache) => {
                cache.put(request, networkResponse);
              });
            }
          })
        );
        return cachedResponse;
      }
      
      // إذا لم يكن مخزناً، نجلبه ونخزنه
      return fetch(request).then((networkResponse) => {
        if (networkResponse.ok) {
          const responseClone = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(request, responseClone);
          });
        }
        return networkResponse;
      });
    })
  );
});
```

2. تحديث `src/components/ServiceWorkerProvider.tsx`:
```tsx
'use client';

import { useEffect } from 'react';

export function ServiceWorkerProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
      navigator.serviceWorker
        .register('/denkmalen/sw.js')
        .then((registration) => {
          console.log('SW registered:', registration.scope);
        })
        .catch((error) => {
          console.log('SW registration failed:', error);
        });
    }
  }, []);

  return <>{children}</>;
}
```

3. تحديث `public/manifest.json`:
```json
{
  "name": "Denkmalen — Drawing Battle Game",
  "short_name": "Denkmalen",
  "description": "Draw words, get judged by AI, and compete with friends!",
  "start_url": "/denkmalen/",
  "display": "standalone",
  "background_color": "#ffffff",
  "theme_color": "#6366f1",
  "orientation": "portrait-primary",
  "icons": [
    {
      "src": "/denkmalen/icons/icon-192.png",
      "sizes": "192x192",
      "type": "image/png",
      "purpose": "any maskable"
    },
    {
      "src": "/denkmalen/icons/icon-512.png",
      "sizes": "512x512",
      "type": "image/png",
      "purpose": "any maskable"
    }
  ],
  "screenshots": [
    {
      "src": "/denkmalen/og.png",
      "sizes": "1200x630",
      "type": "image/png",
      "form_factor": "wide",
      "label": "Denkmalen on desktop"
    }
  ]
}
```

**الجهد:** 6-8 ساعات  
**المتطلبات:** أيقونات PNG (192px, 512px)

---

### ✅ 3.2 Offline Mode محسّن - مكتمل

**المشكلة:** اللعبة تتوقف بدون إنترنت.

**الملفات المتأثرة:**
```
src/lib/offline-storage.ts  — جديد: تخزين محلي للكلمات
src/store/gameStore.ts       — تحديث: دعم offline
```

**الخطوات:**

1. إنشاء `src/lib/offline-storage.ts`:
```ts
const OFFLINE_WORDS_KEY = 'denkmalen-offline-words';

export const saveWordsOffline = (words: string[], lang: string) => {
  const stored = getOfflineWords(lang);
  const merged = [...new Set([...stored, ...words])];
  localStorage.setItem(`${OFFLINE_WORDS_KEY}-${lang}`, JSON.stringify(merged));
};

export const getOfflineWords = (lang: string): string[] => {
  const data = localStorage.getItem(`${OFFLINE_WORDS_KEY}-${lang}`);
  return data ? JSON.parse(data) : [];
};

export const getRandomOfflineWord = (lang: string): string | null => {
  const words = getOfflineWords(lang);
  if (words.length === 0) return null;
  return words[Math.floor(Math.random() * words.length)];
};
```

2. تحديث `src/store/gameStore.ts`:
```ts
// في startOfflineGame
startOfflineGame: (playerNames: string[]) => {
  const { language } = get();
  
  // محاولة الحصول على كلمة من التخزين المحلي
  const offlineWord = getRandomOfflineWord(language);
  if (offlineWord) {
    // استخدام الكلمة المخزنة
    set({ currentWord: offlineWord });
  }
  
  // ... باقي الكود
},
```

**الجهد:** 4-5 ساعات  
**المتطلبات:** فهم Store structure

---

## 🎯 المرحلة 4: تحسين الأداء (أسبوع 4)

### ✅ 4.1 تحسين Bundle Size - مكتمل

**المشكلة:** Bundle كبير ~350KB، الهدف <200KB.

**الملفات المتأثرة:**
```
next.config.js              — تحسين الإعدادات
src/app/page.tsx            — Dynamic imports
src/components/*.tsx        — Lazy loading
```

**الخطوات:**

1. تحديث `next.config.js`:
```js
module.exports = {
  // الإعدادات الحالية
  
  experimental: {
    optimizePackageImports: [
      'framer-motion',
      '@heroicons/react',
      'lucide-react',
    ],
  },
  
  // تعطيل experimental.optimizePackageImports إذا كان يسبب مشاكل
  // experimental: {},
};
```

2. إضافة Dynamic Imports في `src/app/page.tsx`:
```tsx
import dynamic from 'next/dynamic';

// تحميل كسول للمكونات الكبيرة
const DrawingScreen = dynamic(
  () => import('@/components/DrawingScreen').then(mod => ({ default: mod.DrawingScreen })),
  { 
    loading: () => <LoadingSpinner />,
    ssr: false 
  }
);

const VotingScreen = dynamic(
  () => import('@/components/VotingScreen').then(mod => ({ default: mod.VotingScreen })),
  { 
    loading: () => <LoadingSpinner />,
    ssr: false 
  }
);

const ResultsScreen = dynamic(
  () => import('@/components/ResultsScreen').then(mod => ({ default: mod.ResultsScreen })),
  { 
    loading: () => <LoadingSpinner />,
    ssr: false 
  }
);
```

3. تحديث `src/app/layout.tsx`:
```tsx
// استيراد كسول للمكتبات الثقيلة
import dynamic from 'next/dynamic';

const FramerMotion = dynamic(
  () => import('framer-motion'),
  { ssr: false }
);

const ThemeProvider = dynamic(
  () => import('@/components/ThemeProvider').then(mod => ({ default: mod.ThemeProvider })),
  { ssr: false }
);
```

**الجهد:** 4-5 ساعات  
**المتطلبات:** اختبار بعد التعديل

---

### ✅ 4.2 تحسين الصور - مكتمل

**المشكلة:** `unoptimized: true` يعني لا يوجد تحسين صور.

**الملفات المتأثرة:**
```
next.config.js              — تعطيل unoptimized
```

**الخطوات:**

1. تحديث `next.config.js`:
```js
module.exports = {
  images: {
    unoptimized: false,  // تفعيل تحسين الصور
    formats: ['image/avif', 'image/webp'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
  },
};
```

**الجهد:** ساعة واحدة  
**المتطلبات:** لا شيء

---

## 🎯 المرحلة 5: Plugin System (أسبوع 5)

### ✅ 5.1 تطوير Plugin Challenges - مكتمل

**المشكلة:** 9 إضافات فارغة، نبدأ بالأخطر.

**الملفات المتأثرة:**
```
src/plugins/challenges/index.ts    — تحديث
src/plugins/challenges/registry.ts — تحديث
src/plugins/challenges/types.ts    — تحديث
src/components/ChallengeBanner.tsx  — جديد
```

**الخطوات:**

1. تحديث `src/plugins/challenges/types.ts`:
```ts
export interface Challenge {
  id: string;
  name: string;
  description: string;
  icon: string;
  modifier: (drawing: Drawing) => Drawing;
  validator?: (drawing: Drawing) => boolean;
}

export interface ChallengeResult {
  challengeId: string;
  applied: boolean;
  bonusPoints: number;
}
```

2. تحديث `src/plugins/challenges/registry.ts`:
```ts
import { Challenge } from './types';

export const challenges: Challenge[] = [
  {
    id: 'one-color',
    name: 'One Color Challenge',
    description: 'Draw using only one color!',
    icon: '🎨',
    modifier: (drawing) => {
      // تحويل كل الألوان إلى لون واحد
      const primaryColor = drawing.colors[0] || '#000000';
      return {
        ...drawing,
        colors: [primaryColor],
        dataUrl: applyColorFilter(drawing.dataUrl, primaryColor),
      };
    },
  },
  {
    id: 'no-eraser',
    name: 'No Eraser',
    description: 'No mistakes allowed!',
    icon: '🚫',
    modifier: (drawing) => drawing, // لا تغيير، فقط تقييد
    validator: (drawing) => !drawing.hasEraser,
  },
  {
    id: 'speed',
    name: 'Speed Drawing',
    description: 'Draw in 15 seconds!',
    icon: '⚡',
    modifier: (drawing) => ({
      ...drawing,
      timeLimit: 15,
    }),
  },
  {
    id: 'mirror',
    name: 'Mirror Mode',
    description: 'Draw mirrored!',
    icon: '🪞',
    modifier: (drawing) => ({
      ...drawing,
      dataUrl: mirrorImage(drawing.dataUrl),
    }),
  },
];
```

3. إنشاء `src/components/ChallengeBanner.tsx`:
```tsx
'use client';

import { motion } from 'framer-motion';
import { Challenge } from '@/plugins/challenges/types';

interface ChallengeBannerProps {
  challenge: Challenge;
  onDismiss: () => void;
}

export function ChallengeBanner({ challenge, onDismiss }: ChallengeBannerProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="bg-gradient-to-r from-amber-500 to-orange-500 text-white p-4 rounded-xl mb-4"
    >
      <div className="flex items-center gap-3">
        <span className="text-3xl">{challenge.icon}</span>
        <div className="flex-1">
          <h3 className="font-bold">{challenge.name}</h3>
          <p className="text-sm opacity-90">{challenge.description}</p>
        </div>
        <button
          onClick={onDismiss}
          className="text-white/80 hover:text-white"
        >
          ✕
        </button>
      </div>
    </motion.div>
  );
}
```

**الجهد:** 8-10 ساعات  
**المتطلبات:** فهم Plugin System

---

### 5.2 تطوير Plugin Audio

**الملفات المتأثرة:**
```
src/plugins/audio/index.ts    — تحديث
src/plugins/audio/sounds.ts   — تحديث
src/plugins/audio/effects.ts  — تحديث
```

**الخطوات:**

1. تحديث `src/plugins/audio/sounds.ts`:
```ts
export const sounds = {
  // أصوات اللعبة
  roundStart: '/denkmalen/sounds/round-start.mp3',
  roundEnd: '/denkmalen/sounds/round-end.mp3',
  correctGuess: '/denkmalen/sounds/correct.mp3',
  wrongGuess: '/denkmalen/sounds/wrong.mp3',
  drawStart: '/denkmalen/sounds/draw-start.mp3',
  drawEnd: '/denkmalen/sounds/draw-end.mp3',
  
  // أصوات UI
  buttonClick: '/denkmalen/sounds/click.mp3',
  buttonHover: '/denkmalen/sounds/hover.mp3',
  notification: '/denkmalen/sounds/notification.mp3',
  error: '/denkmalen/sounds/error.mp3',
  
  // أصوات الأحداث
  confetti: '/denkmalen/sounds/confetti.mp3',
  victory: '/denkmalen/sounds/victory.mp3',
  defeat: '/denkmalen/sounds/defeat.mp3',
};
```

2. تحديث `src/plugins/audio/index.ts`:
```ts
import { Plugin } from '@/plugin-system/types';
import { sounds } from './sounds';

class AudioPlugin implements Plugin {
  name = 'audio';
  version = '1.0.0';
  
  private audioContext: AudioContext | null = null;
  private enabled = true;
  private volume = 0.5;
  
  async initialize() {
    // إنشاء AudioContext عند أول تفاعل
    if (typeof window !== 'undefined') {
      this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
  }
  
  play(soundName: keyof typeof sounds) {
    if (!this.enabled || !this.audioContext) return;
    
    const audio = new Audio(sounds[soundName]);
    audio.volume = this.volume;
    audio.play().catch(console.error);
  }
  
  setVolume(volume: number) {
    this.volume = Math.max(0, Math.min(1, volume));
  }
  
  toggle() {
    this.enabled = !this.enabled;
    return this.enabled;
  }
  
  destroy() {
    this.audioContext?.close();
  }
}

export const audioPlugin = new AudioPlugin();
```

**الجهد:** 6-8 ساعات  
**المتطلبات:** ملفات صوتية (MP3)

---

## 🎯 المرحلة 6: التحليلات والتوثيق (أسبوع 6)

### ✅ 6.1 إضافة Analytics - مكتمل

**المشكلة:** لا يتتبع أحداث الاستخدام.

**الملفات المتأثرة:**
```
src/lib/analytics.ts         — جديد
src/components/*.tsx         — إضافة تتبع الأحداث
```

**الخطوات:**

1. إنشاء `src/lib/analytics.ts`:
```ts
// بسيط بدون مكتبات خارجية
export const track = (event: string, data?: Record<string, any>) => {
  if (typeof window === 'undefined') return;
  
  // إرسال لـ Google Analytics 4
  if (window.gtag) {
    window.gtag('event', event, data);
  }
  
  // طباعة في التطوير
  if (process.env.NODE_ENV === 'development') {
    console.log(`[Analytics] ${event}`, data);
  }
};

// أحداث محددة
export const analytics = {
  // أحداث اللعبة
  gameStart: (mode: 'offline' | 'online') => track('game_start', { mode }),
  gameEnd: (players: number, rounds: number) => track('game_end', { players, rounds }),
  roundStart: (round: number) => track('round_start', { round }),
  
  // أحداث الرسم
  drawingStart: () => track('drawing_start'),
  drawingEnd: (duration: number) => track('drawing_end', { duration }),
  toolSelect: (tool: string) => track('tool_select', { tool }),
  
  // أحداث التقييم
  aiEvaluation: (score: number) => track('ai_evaluation', { score }),
  manualVote: () => track('manual_vote'),
  
  // أحداث المشاركة
  shareResult: (method: 'native' | 'download') => track('share_result', { method }),
  
  // أحداث الأخطاء
  error: (type: string, message: string) => track('error', { type, message }),
};
```

2. إضافة في `src/components/MainMenu.tsx`:
```tsx
import { analytics } from '@/lib/analytics';

export function MainMenu() {
  const handlePlayNow = () => {
    analytics.gameStart('offline');
    startOfflineGame();
  };
  
  return (
    // ... JSX
    <button onClick={handlePlayNow}>Play Now</button>
  );
}
```

**الجهد:** 3-4 ساعات  
**المتطلبات:** حساب Google Analytics (اختياري)

---

### 6.2 تحديث التوثيق

**الملفات المتأثرة:**
```
README.md                    — تحديث شامل
CONTRIBUTING.md              — تحديث
docs/DEVELOPMENT.md          — جديد
docs/ARCHITECTURE.md         — جديد
```

**الخطوات:**

1. تحديث `README.md`:
```markdown
# 🎨 Denkmalen — Drawing Battle Game

[![CI](https://github.com/MOT1209/mein-wep/actions/workflows/ci.yml/badge.svg)](https://github.com/MOT1209/mein-wep/actions/workflows/ci.yml)
[![Coverage](https://codecov.io/gh/MOT1209/mein-wep/branch/main/graph/badge.svg)](https://codecov.io/gh/MOT1209/mein-wep)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

A creative drawing battle game with AI judge. Draw words, get scored by Gemini AI, and compete with friends!

## 🎮 Features

- 🎨 **Drawing Tools**: Pencil, brush, marker, eraser, fill bucket
- 🤖 **AI Judge**: Powered by Google Gemini 2.5 Flash
- 👥 **Multiplayer**: 2-8 players, local or online
- 🌍 **Multilingual**: English, Arabic, German
- 🌙 **Dark Mode**: Easy on the eyes
- 📱 **Mobile First**: Works on any device
- 🔌 **Plugin System**: Extensible architecture

## 🚀 Quick Start

### Prerequisites

- Node.js 20+
- npm or yarn
- Gemini API key (for AI features)

### Installation

```bash
# Clone the repository
git clone https://github.com/MOT1209/mein-wep.git
cd mein-wep/games/denkmalen-game

# Install dependencies
npm install

# Copy environment variables
cp .env.example .env.local

# Add your API keys to .env.local

# Start development server
npm run dev
```

### Available Scripts

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm test             # Run tests
npm run test:watch   # Run tests in watch mode
npm run test:coverage # Run tests with coverage
npm run lint         # Run linter
```

## 📁 Project Structure

```
src/
├── app/                    # Next.js App Router
│   ├── api/               # API routes
│   │   ├── evaluate/      # AI evaluation endpoint
│   │   ├── generate-word/ # Word generation endpoint
│   │   └── hints/         # Hints endpoint
│   ├── layout.tsx         # Root layout
│   └── page.tsx           # Home page
├── components/            # React components
│   ├── drawing/           # Drawing-related components
│   ├── MainMenu.tsx       # Main menu
│   ├── DrawingScreen.tsx  # Drawing canvas
│   ├── VotingScreen.tsx   # Voting interface
│   └── ResultsScreen.tsx  # Results display
├── hooks/                 # Custom React hooks
├── lib/                   # Utility functions
│   ├── gemini.ts          # Gemini AI integration
│   ├── supabase.ts        # Supabase client
│   └── i18n.ts           # Internationalization
├── plugins/               # Plugin system
│   ├── ai/                # AI evaluation plugin
│   ├── audio/             # Sound effects plugin
│   └── challenges/        # Game challenges plugin
├── store/                 # Zustand state management
│   └── gameStore.ts       # Game state
└── plugin-system/         # Plugin architecture
    ├── types.ts           # Plugin types
    ├── base.ts            # Base plugin class
    └── manager.ts         # Plugin manager
```

## 🧪 Testing

We use Jest + React Testing Library for testing.

```bash
# Run all tests
npm test

# Run specific test file
npm test -- MainMenu.test.tsx

# Run with coverage
npm run test:coverage

# Run in watch mode
npm run test:watch
```

### Writing Tests

```tsx
import { render, screen, fireEvent } from '@testing-library/react';
import { MyComponent } from './MyComponent';

describe('MyComponent', () => {
  it('renders correctly', () => {
    render(<MyComponent />);
    expect(screen.getByText('Hello')).toBeInTheDocument();
  });

  it('handles click events', () => {
    const handleClick = jest.fn();
    render(<MyComponent onClick={handleClick} />);
    fireEvent.click(screen.getByRole('button'));
    expect(handleClick).toHaveBeenCalled();
  });
});
```

## 🌍 Internationalization

We support 3 languages:

- 🇬🇧 English (en)
- 🇸🇦 Arabic (ar)
- 🇩🇪 German (de)

### Adding Translations

1. Add keys to `src/lib/i18n.ts`:

```ts
export const translations = {
  en: {
    'menu.play': 'Play Now',
    'menu.settings': 'Settings',
  },
  ar: {
    'menu.play': 'ابدأ اللعب',
    'menu.settings': 'الإعدادات',
  },
  de: {
    'menu.play': 'Jetzt spielen',
    'menu.settings': 'Einstellungen',
  },
};
```

2. Use in components:

```tsx
import { useTranslation } from '@/lib/i18n';

function MyComponent() {
  const { t, lang } = useTranslation();
  
  return <button>{t('menu.play')}</button>;
}
```

## 🔌 Plugin System

Denkmalen has a plugin system for extending functionality.

### Creating a Plugin

```ts
import { Plugin } from '@/plugin-system/types';

export class MyPlugin implements Plugin {
  name = 'my-plugin';
  version = '1.0.0';
  
  async initialize() {
    // Initialize plugin
  }
  
  destroy() {
    // Cleanup
  }
}

export const myPlugin = new MyPlugin();
```

### Registering a Plugin

```ts
import { pluginManager } from '@/plugin-system/manager';
import { myPlugin } from './plugins/my-plugin';

pluginManager.register(myPlugin);
```

## 🚢 Deployment

### Vercel (Frontend)

1. Push to GitHub
2. Import project in Vercel
3. Set environment variables
4. Deploy

### Railway/Render (Socket Server)

1. Connect GitHub repository
2. Set `SOCKET_ONLY=1` environment variable
3. Deploy

## 📝 Environment Variables

See `.env.example` for all required variables.

| Variable | Description | Required |
|----------|-------------|----------|
| `NEXT_PUBLIC_GEMINI_API_KEY` | Google Gemini API key | Yes |
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL | Yes |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anonymous key | Yes |
| `NEXT_PUBLIC_SOCKET_URL` | Socket.IO server URL | Yes |
| `NEXT_PUBLIC_SENTRY_DSN` | Sentry DSN | No |

## 🤝 Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for details.

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [Next.js](https://nextjs.org/) - React framework
- [Tailwind CSS](https://tailwindcss.com/) - CSS framework
- [Zustand](https://github.com/pmndrs/zustand) - State management
- [Framer Motion](https://www.framer.com/motion/) - Animations
- [Google Gemini](https://ai.google.dev/) - AI evaluation
- [Supabase](https://supabase.com/) - Backend services
```

**الجهد:** 4-5 ساعات  
**المتطلبات:** لا شيء

---

## 📅 الجدول الزمني

| الأسبوع | المرحلة | المهام الرئيسية | الجهد |
|---------|---------|-----------------|-------|
| 1 | الأساسيات | ✅ Sentry + ✅ Socket fix + ✅ CI/CD | مكتمل |
| 2 | الاختبارات | ⏳ قيد التنفيذ | جاري |
| 3 | PWA | ✅ Service Worker + ✅ Offline | مكتمل |
| 4 | الأداء | ✅ Bundle + ✅ Images | مكتمل |
| 5 | Plugins | ✅ All 10 plugins + UI | مكتمل |
| 6 | التوثيق | ✅ Analytics + ✅ Docs | مكتمل |

**الإجمالي:** 56-71 ساعة عمل

---

## 📊 مقاييس النجاح

| المقياس | الحالي | بعد 6 أسابيع |
|---------|--------|--------------|
| تغطية الاختبارات | 30% | 80% |
| حجم Bundle | 350KB | <200KB |
| Error Tracking | لا يوجد | ✅ Sentry |
| CI/CD | لا يوجد | ✅ GitHub Actions |
| PWA | جزئي | ✅ كامل |
| Plugins | 1/10 | 3/10 |
| التوثيق | أساسي | شامل |

---

## 🔄 مراجعة دورية

- **كل أسبوع:** مراجعة التقدم وتحديث هذا الملف
- **كل أسبوعين:** مراجعة مقاييس الأداء
- **نهاية كل مرحلة:** مراجعة شاملة وتحديث الجدول الزمني

---

## 📌 ملاحظات

1. **الأولوية للتثبيت:** Error Tracking > CI/CD > الاختبارات
2. **لا تكمل مرحلة بدون اختبار:** كل مرحلة يجب أن تكون مستقرة قبل البدء في التالية
3. ** Git Commits:** استخدم `type(scope): description` pattern
4. **المراجعة:** كل PR يحتاج مراجعة قبل الدمج

---

*آخر تحديث: 2026-07-17*
