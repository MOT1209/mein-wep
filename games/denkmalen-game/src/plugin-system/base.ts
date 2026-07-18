// ═══════════════════════════════════════════════════════════════════════════════
// Sketch Battle AI — Base Plugin Factory
// Helper for creating consistent plugin implementations
// ═══════════════════════════════════════════════════════════════════════════════

import { Plugin, PluginID, PluginManifest } from './types'
import { pluginManager } from './manager'

type EventHandler = (...args: unknown[]) => void

export interface PluginContext {
  emit: (event: string, ...args: unknown[]) => void
  on: (event: string, handler: EventHandler) => void
  off: (event: string, handler: EventHandler) => void
}

export interface BasePluginConfig {
  enabled?: boolean
  [key: string]: unknown
}

/**
 * Create a plugin with standard structure
 */
export function createPlugin<TConfig extends BasePluginConfig>(
  manifest: PluginManifest,
  setup: (ctx: PluginContext, config: TConfig) => {
    onInit?: () => void | Promise<void>
    onActivate?: () => void | Promise<void>
    onDeactivate?: () => void | Promise<void>
    onDestroy?: () => void | Promise<void>
  }
): { create: () => Plugin<TConfig> } {
  return {
    create: () => {
      const config: TConfig = { enabled: true } as TConfig

      const ctx: PluginContext = {
        emit: (event, ...args) => pluginManager.emit(event, ...args),
        on: (event, handler) => pluginManager.on(event, handler),
        off: (event, handler) => pluginManager.off(event, handler),
      }

      const hooks = setup(ctx, config)

      return {
        manifest,
        config,
        onInit: hooks.onInit,
        onActivate: hooks.onActivate,
        onDeactivate: hooks.onDeactivate,
        onDestroy: hooks.onDestroy,
      }
    }
  }
}
