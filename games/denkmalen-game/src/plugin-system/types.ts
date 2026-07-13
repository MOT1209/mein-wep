// ═══════════════════════════════════════════════════════════════════════════════
// Sketch Battle AI — Plugin System Types
// ═══════════════════════════════════════════════════════════════════════════════

export type PluginID = 
  | 'ai' 
  | 'challenges' 
  | 'cosmetics' 
  | 'replay' 
  | 'tournaments' 
  | 'teams' 
  | 'statistics' 
  | 'audio' 
  | 'community' 
  | 'settings'

export type PluginStatus = 'active' | 'inactive' | 'error' | 'loading'

export interface PluginManifest {
  id: PluginID
  name: string
  version: string
  description: string
  author: string
  dependencies?: PluginID[]  // Other plugins this one depends on
  optional?: boolean         // Can be disabled without breaking core
}

export interface Plugin<TConfig = Record<string, unknown>> {
  manifest: PluginManifest
  config: TConfig
  
  // Lifecycle hooks
  onInit?: () => void | Promise<void>
  onActivate?: () => void | Promise<void>
  onDeactivate?: () => void | Promise<void>
  onDestroy?: () => void | Promise<void>
  
  // Event system
  on?: (event: string, handler: (...args: unknown[]) => void) => void
  off?: (event: string, handler: (...args: unknown[]) => void) => void
  emit?: (event: string, ...args: unknown[]) => void
}

export interface PluginRegistry {
  register(plugin: Plugin): void
  unregister(id: PluginID): void
  get<T extends Plugin = Plugin>(id: PluginID): T | undefined
  getAll(): Plugin[]
  getActive(): Plugin[]
  activate(id: PluginID): Promise<void>
  deactivate(id: PluginID): Promise<void>
  isActive(id: PluginID): boolean
}

// Core game events that plugins can listen to
export type CoreEventType =
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

// Plugin can emit custom events
export type PluginEventType = `${PluginID}:${string}`

export type EventType = CoreEventType | PluginEventType
