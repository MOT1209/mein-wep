// ═══════════════════════════════════════════════════════════════════════════════
// Sketch Battle AI — Plugin Loader
// Auto-loads and registers all enabled plugins
// ═══════════════════════════════════════════════════════════════════════════════

import { pluginManager } from './manager'
import { Plugin, PluginID } from './types'

// Plugin registry - add new plugins here
const PLUGIN_REGISTRY: Array<{
  id: PluginID
  loader: () => Promise<{ default: Plugin }>
}> = [
  { id: 'ai',           loader: () => import('../plugins/ai') },
  { id: 'challenges',   loader: () => import('../plugins/challenges') },
  { id: 'cosmetics',    loader: () => import('../plugins/cosmetics') },
  { id: 'replay',       loader: () => import('../plugins/replay') },
  { id: 'tournaments',  loader: () => import('../plugins/tournaments') },
  { id: 'teams',        loader: () => import('../plugins/teams') },
  { id: 'statistics',   loader: () => import('../plugins/statistics') },
  { id: 'audio',        loader: () => import('../plugins/audio') },
  { id: 'community',    loader: () => import('../plugins/community') },
  { id: 'settings',     loader: () => import('../plugins/settings') },
]

// Default enabled plugins
const DEFAULT_ENABLED: PluginID[] = [
  'ai',
  'statistics',
  'audio',
  'settings',
]

// User preferences (persisted to localStorage)
let enabledPlugins: PluginID[] = [...DEFAULT_ENABLED]

/**
 * Load plugin preferences from localStorage
 */
function loadPreferences(): void {
  if (typeof window === 'undefined') return
  
  try {
    const stored = localStorage.getItem('sketch-battle:plugins')
    if (stored) {
      enabledPlugins = JSON.parse(stored)
    }
  } catch {
    // Use defaults
  }
}

/**
 * Save plugin preferences to localStorage
 */
function savePreferences(): void {
  if (typeof window === 'undefined') return
  
  try {
    localStorage.setItem('sketch-battle:plugins', JSON.stringify(enabledPlugins))
  } catch {
    // Silent fail
  }
}

/**
 * Initialize all enabled plugins
 */
export async function initPlugins(): Promise<void> {
  loadPreferences()
  
  console.log('[PluginLoader] Initializing plugins...')
  
  const loadPromises = PLUGIN_REGISTRY.map(async ({ id, loader }) => {
    try {
      const loaded = await loader()
      pluginManager.register(loaded.default)
      
      if (enabledPlugins.includes(id)) {
        await pluginManager.activate(id)
      }
    } catch (err) {
      console.error(`[PluginLoader] Failed to load plugin "${id}":`, err)
    }
  })
  
  await Promise.allSettled(loadPromises)
  
  console.log('[PluginLoader] Done. Status:', pluginManager.getStatusMap())
}

/**
 * Enable a plugin
 */
export async function enablePlugin(id: PluginID): Promise<void> {
  if (!enabledPlugins.includes(id)) {
    enabledPlugins.push(id)
    savePreferences()
  }
  
  await pluginManager.activate(id)
}

/**
 * Disable a plugin
 */
export async function disablePlugin(id: PluginID): Promise<void> {
  enabledPlugins = enabledPlugins.filter(p => p !== id)
  savePreferences()
  
  await pluginManager.deactivate(id)
}

/**
 * Toggle a plugin on/off
 */
export async function togglePlugin(id: PluginID): Promise<boolean> {
  if (pluginManager.isActive(id)) {
    await disablePlugin(id)
    return false
  } else {
    await enablePlugin(id)
    return true
  }
}

/**
 * Get all available plugins with their status
 */
export function getPluginsStatus() {
  return pluginManager.listPlugins()
}

/**
 * Check if a plugin is enabled
 */
export function isPluginEnabled(id: PluginID): boolean {
  return enabledPlugins.includes(id)
}
