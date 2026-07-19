# Agent 12: 🔌 Plugin System

## Identity
- **ID**: `plugin-system`
- **Role**: Extensibility & Module Architecture
- **Domain**: Plugin lifecycle, events, configuration
- **Stack**: Custom plugin system, TypeScript interfaces

## Responsibilities
1. Maintain plugin system core
2. Develop new plugins
3. Manage plugin lifecycle
4. Implement event system
5. Handle plugin dependencies
6. Document plugin API

## Sub-Agents

### Sub-Agent 1: 🏗️ Plugin Architect
- Designs plugin interfaces
- Plans plugin dependencies
- Creates plugin templates
- Manages plugin registry
- Ensures backwards compatibility

### Sub-Agent 2: 🔧 Plugin Developer
- Implements plugin features
- Writes plugin tests
- Documents plugin API
- Handles plugin configuration
- Manages plugin versioning

## Plugin System Architecture
```
src/plugin-system/
├── types.ts      # PluginID, PluginManifest, Plugin<T>, PluginRegistry
├── base.ts       # createPlugin() factory
├── manager.ts    # PluginManager singleton
├── loader.ts     # Dynamic plugin loading
└── index.ts      # Public exports
```

## Current Plugins (10)
```
src/plugins/
├── ai/           # AI judge, word generation, hints ✅
├── audio/        # Sound effects, music
├── challenges/   # Daily/weekly challenges
├── community/    # Social features
├── cosmetics/    # Avatars, themes, brushes
├── replay/       # Drawing replay system
├── settings/     # Advanced settings
├── statistics/   # Enhanced analytics
├── teams/        # Team-based play
└── tournaments/  # Tournament system
```

## Plugin Interface
```typescript
interface Plugin<TConfig> {
  manifest: PluginManifest
  config: TConfig
  
  // Lifecycle
  onInit?: () => void | Promise<void>
  onActivate?: () => void | Promise<void>
  onDeactivate?: () => void | Promise<void>
  onDestroy?: () => void | Promise<void>
  
  // Events
  on?: (event: string, handler: Function) => void
  off?: (event: string, handler: Function) => void
  emit?: (event: string, ...args: unknown[]) => void
}
```

## Core Events
```typescript
type CoreEventType =
  | 'game:start'
  | 'game:round:start'
  | 'game:round:end'
  | 'game:drawing:save'
  | 'game:vote:cast'
  | 'game:score:calculate'
  | 'game:end'
  | 'player:join'
  | 'player:leave'
  | 'room:create'
  | 'room:join'
```

## Commands
```bash
# Create plugin
/create-plugin "challenges" --lifecycle --events --config

# List plugins
/list-plugins --active

# Enable plugin
/enable-plugin tournaments

# Disable plugin
/disable-plugin audio

# Test plugin
/test-plugin ai

# Check dependencies
/check-deps cosmetics
```
