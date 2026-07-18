// ═══════════════════════════════════════════════════════════════════════════════
// Sketch Battle AI — Plugin Manager
// ═══════════════════════════════════════════════════════════════════════════════

import { Plugin, PluginID, PluginRegistry, PluginStatus } from './types'

interface PluginEntry {
  plugin: Plugin
  status: PluginStatus
  error?: string
}

type EventHandler = (...args: unknown[]) => void

class PluginManager implements PluginRegistry {
  private plugins = new Map<PluginID, PluginEntry>()
  private eventHandlers = new Map<string, Set<EventHandler>>()
  private eventHistory: Array<{ event: string; args: unknown[]; timestamp: number }> = []

  // ─── Registration ───────────────────────────────────────────────────────

  register(plugin: Plugin): void {
    const { id } = plugin.manifest
    
    if (this.plugins.has(id)) {
      console.warn(`[PluginManager] Plugin "${id}" already registered, replacing...`)
    }

    this.plugins.set(id, {
      plugin,
      status: 'inactive'
    })

    console.log(`[PluginManager] Registered: ${plugin.manifest.name} v${plugin.manifest.version}`)
  }

  unregister(id: PluginID): void {
    const entry = this.plugins.get(id)
    if (!entry) return

    // Deactivate first if active
    if (entry.status === 'active') {
      this.deactivate(id)
    }

    // Call onDestroy if exists
    entry.plugin.onDestroy?.()
    
    this.plugins.delete(id)
    console.log(`[PluginManager] Unregistered: ${id}`)
  }

  // ─── Getters ────────────────────────────────────────────────────────────

  get<T extends Plugin = Plugin>(id: PluginID): T | undefined {
    return this.plugins.get(id)?.plugin as T | undefined
  }

  getAll(): Plugin[] {
    return Array.from(this.plugins.values()).map(e => e.plugin)
  }

  getActive(): Plugin[] {
    return Array.from(this.plugins.values())
      .filter(e => e.status === 'active')
      .map(e => e.plugin)
  }

  getStatus(id: PluginID): PluginStatus {
    return this.plugins.get(id)?.status ?? 'inactive'
  }

  isActive(id: PluginID): boolean {
    return this.getStatus(id) === 'active'
  }

  // ─── Lifecycle ──────────────────────────────────────────────────────────

  async activate(id: PluginID): Promise<void> {
    const entry = this.plugins.get(id)
    if (!entry) {
      console.error(`[PluginManager] Plugin "${id}" not found`)
      return
    }

    if (entry.status === 'active') {
      console.warn(`[PluginManager] Plugin "${id}" already active`)
      return
    }

    // Check dependencies
    const deps = entry.plugin.manifest.dependencies || []
    for (const dep of deps) {
      if (!this.isActive(dep)) {
        console.warn(`[PluginManager] Activating dependency "${dep}" for "${id}"`)
        await this.activate(dep)
      }
    }

    try {
      entry.status = 'loading'
      await entry.plugin.onInit?.()
      await entry.plugin.onActivate?.()
      entry.status = 'active'
      this.emit(`${id}:activated`)
      console.log(`[PluginManager] Activated: ${id}`)
    } catch (err) {
      entry.status = 'error'
      entry.error = err instanceof Error ? err.message : String(err)
      console.error(`[PluginManager] Failed to activate "${id}":`, err)
    }
  }

  async deactivate(id: PluginID): Promise<void> {
    const entry = this.plugins.get(id)
    if (!entry || entry.status !== 'active') return

    // Check if other active plugins depend on this one
    const dependents = Array.from(this.plugins.values())
      .filter(e => 
        e.status === 'active' && 
        e.plugin.manifest.dependencies?.includes(id)
      )

    if (dependents.length > 0) {
      console.warn(
        `[PluginManager] Cannot deactivate "${id}": depended on by:`,
        dependents.map(e => e.plugin.manifest.id)
      )
      return
    }

    try {
      await entry.plugin.onDeactivate?.()
      entry.status = 'inactive'
      this.emit(`${id}:deactivated`)
      console.log(`[PluginManager] Deactivated: ${id}`)
    } catch (err) {
      console.error(`[PluginManager] Failed to deactivate "${id}":`, err)
    }
  }

  // ─── Event System ───────────────────────────────────────────────────────

  on(event: string, handler: EventHandler): void {
    if (!this.eventHandlers.has(event)) {
      this.eventHandlers.set(event, new Set())
    }
    this.eventHandlers.get(event)!.add(handler)
  }

  off(event: string, handler: EventHandler): void {
    this.eventHandlers.get(event)?.delete(handler)
  }

  emit(event: string, ...args: unknown[]): void {
    // Record history
    this.eventHistory.push({ event, args, timestamp: Date.now() })
    
    // Keep only last 100 events
    if (this.eventHistory.length > 100) {
      this.eventHistory.shift()
    }

    // Notify handlers
    const handlers = this.eventHandlers.get(event)
    if (handlers) {
      handlers.forEach(handler => {
        try {
          handler(...args)
        } catch (err) {
          console.error(`[PluginManager] Event handler error for "${event}":`, err)
        }
      })
    }

    // Also emit to wildcard handlers
    const wildcardHandlers = this.eventHandlers.get('*')
    if (wildcardHandlers) {
      wildcardHandlers.forEach(handler => {
        try {
          handler(event, ...args)
        } catch (err) {
          console.error(`[PluginManager] Wildcard handler error:`, err)
        }
      })
    }
  }

  getHistory(event?: string): Array<{ event: string; args: unknown[]; timestamp: number }> {
    if (event) {
      return this.eventHistory.filter(e => e.event === event)
    }
    return [...this.eventHistory]
  }

  // ─── Debug ──────────────────────────────────────────────────────────────

  getStatusMap(): Record<PluginID, PluginStatus> {
    const map: Record<string, PluginStatus> = {}
    this.plugins.forEach((entry, id) => {
      map[id] = entry.status
    })
    return map as Record<PluginID, PluginStatus>
  }

  listPlugins(): Array<{ id: PluginID; name: string; version: string; status: PluginStatus }> {
    return Array.from(this.plugins.entries()).map(([id, entry]) => ({
      id,
      name: entry.plugin.manifest.name,
      version: entry.plugin.manifest.version,
      status: entry.status
    }))
  }
}

// Singleton
export const pluginManager = new PluginManager()
