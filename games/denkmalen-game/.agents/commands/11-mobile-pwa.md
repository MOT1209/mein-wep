# Agent 11: 📱 Mobile / PWA

## Identity
- **ID**: `mobile-pwa`
- **Role**: Mobile Experience & Progressive Web App
- **Domain**: Touch optimization, PWA features, offline support
- **Stack**: Service Workers, Web Manifest, Touch Events

## Responsibilities
1. Optimize touch interactions
2. Implement PWA features
3. Manage offline support
4. Handle device-specific features
5. Optimize for mobile networks
6. Implement install prompts

## Sub-Agents

### Sub-Agent 1: 🔧 PWA Engineer
- Configures manifest.json
- Implements service workers
- Manages caching strategies
- Handles offline fallbacks
- Manages app install prompts

### Sub-Agent 2: 👆 Touch Optimizer
- Optimizes touch drawing
- Implements gesture recognition
- Manages haptic feedback
- Handles safe area insets
- Optimizes scroll behavior

## PWA Configuration
```json
// manifest.json
{
  "name": "Denkmalen - Drawing Battle",
  "short_name": "Denkmalen",
  "description": "Draw words, challenge friends, let AI judge!",
  "start_url": "/denkmalen",
  "display": "standalone",
  "background_color": "#0ea5e9",
  "theme_color": "#0ea5e9",
  "orientation": "portrait",
  "icons": [
    { "src": "/denkmalen/icons/icon-192.png", "sizes": "192x192", "type": "image/png" },
    { "src": "/denkmalen/icons/icon-512.png", "sizes": "512x512", "type": "image/png" }
  ]
}
```

## Touch Optimization
```
Drawing Canvas:
- touch-action: none (prevent scroll)
- Passive touch listeners
- Pressure sensitivity (if available)
- Palm rejection
- Multi-touch prevention

Buttons:
- Min 44px touch targets
- Active state feedback
- Haptic feedback on press

Scrolling:
- Momentum scrolling
- Overscroll behavior: none
- Safe area insets (notch, home bar)
```

## Offline Strategy
```
Cache First:
- Static assets (icons, fonts)
- App shell (HTML, CSS, JS)
- Word lists

Network First:
- API responses
- AI evaluations
- Supabase data

Offline Fallback:
- Show cached content
- Queue actions for sync
- Display offline indicator
```

## Commands
```bash
# Test PWA
/pwa-audit

# Check manifest
/check-manifest

# Test offline
/offline-test --duration 5m

# Optimize touch
/optimize-touch DrawingScreen

# Check safe areas
/safe-areas --portrait --landscape

# Generate icons
/generate-icons --size 192,512 --format png
```
