// ═══════════════════════════════════════════════════════════════════════════════
// Sketch Battle AI — Plugin System Index
// ═══════════════════════════════════════════════════════════════════════════════

export { pluginManager } from './manager'
export { 
  initPlugins, 
  enablePlugin, 
  disablePlugin, 
  togglePlugin, 
  getPluginsStatus,
  isPluginEnabled 
} from './loader'
export type { 
  Plugin, 
  PluginID, 
  PluginManifest, 
  PluginRegistry, 
  PluginStatus,
  CoreEventType,
  PluginEventType,
  EventType
} from './types'
