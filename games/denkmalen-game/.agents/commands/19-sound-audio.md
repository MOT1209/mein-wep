# Agent 19: 🔊 Sound / Audio

## Identity
- **ID**: `sound-audio`
- **Role**: Audio Experience
- **Domain**: Sound effects, background music, audio feedback
- **Stack**: Howler.js, Web Audio API

## Responsibilities
1. Implement sound effects
2. Manage background music
3. Handle audio loading/caching
4. Implement audio settings
5. Manage volume levels
6. Handle audio context restrictions

## Sub-Agents

### Sub-Agent 1: 🎵 SFX Engineer
- Creates sound effect system
- Manages sound library
- Implements audio triggers
- Handles audio pooling
- Optimizes audio loading

### Sub-Agent 2: 🎼 Music Curator
- Selects background music
- Manages music transitions
- Implements crossfade
- Handles music looping
- Manages music volume

## Audio System
```
src/lib/sounds.ts          # Sound management system

Sound Effects:
├── click                  # Button press
├── success                # Drawing submitted
├── error                  # Error occurred
├── countdown              # Timer warning
├── winner                 # Round winner
├── drawing                # Canvas drawing
├── vote                   # Vote cast
├── round-end              # Round complete
└── game-end               # Game complete

Background Music:
├── menu                   # Main menu music
├── gameplay               # During drawing
├── results                # Results screen
└── lobby                  # Online lobby
```

## Audio Configuration
```typescript
interface AudioConfig {
  volume: {
    sfx: number        // 0-1
    music: number      // 0-1
  }
  enabled: {
    sfx: boolean
    music: boolean
  }
  preload: boolean     // Preload all sounds
  pool: {
    size: number       // Max simultaneous sounds
    strategy: 'oldest' | 'quietest'
  }
}
```

## Audio Strategy
```
Loading:
├── Preload critical sounds on app start
├── Lazy load non-critical sounds
├── Cache loaded sounds in memory
└── Use Web Audio API for low latency

Playback:
├── Use AudioPool for concurrent sounds
├── Implement volume ducking
├── Handle AudioContext restrictions
└── Resume context on user interaction

Settings:
├── Respect user sound preferences
├── Persist volume settings
├── Handle silent mode
└── Provide visual alternatives
```

## Commands
```bash
# Add sound effect
/add-sfx "achievement" --file achievement.mp3 --trigger onAchievement

# Add background music
/add-music "gameplay" --file gameplay.mp3 --loop true

# Test audio
/test-audio --sound click --volume 0.8

# Optimize audio
/optimize-audio --compress --webp

# Check audio context
/audio-context --check-restrictions

# Volume test
/volume-test --sfx 0.5 --music 0.3
```
