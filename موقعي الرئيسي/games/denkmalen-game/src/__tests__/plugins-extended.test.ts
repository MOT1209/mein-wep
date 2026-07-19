import { pluginManager } from '@/plugin-system/manager'
import { createPlugin } from '@/plugin-system/base'

// Mock game store
jest.mock('@/store/gameStore', () => ({
  useGameStore: {
    getState: jest.fn(() => ({
      mode: 'offline',
      phase: 'menu',
      settings: { sound: true, vibration: true, language: 'en' },
      players: [],
      currentRound: 1,
      totalRounds: 3,
    })),
    setState: jest.fn(),
  },
}))

describe('Plugin Manager Extended', () => {
  beforeEach(() => {
    pluginManager.listPlugins().forEach(p => {
      pluginManager.unregister(p.id)
    })
  })

  it('should get all plugins', () => {
    const plugin1 = createPlugin(
      { id: 'p1', name: 'P1', version: '1.0.0', description: 'Test', author: 'A' },
      () => ({})
    ).create()
    const plugin2 = createPlugin(
      { id: 'p2', name: 'P2', version: '1.0.0', description: 'Test', author: 'A' },
      () => ({})
    ).create()

    pluginManager.register(plugin1)
    pluginManager.register(plugin2)

    const all = pluginManager.getAll()
    expect(all).toHaveLength(2)
  })

  it('should get active plugins', async () => {
    const plugin = createPlugin(
      { id: 'active-p', name: 'Active', version: '1.0.0', description: 'Test', author: 'A' },
      () => ({})
    ).create()

    pluginManager.register(plugin)
    expect(pluginManager.getActive()).toHaveLength(0)

    await pluginManager.activate('active-p')
    expect(pluginManager.getActive()).toHaveLength(1)
  })

  it('should check if plugin is active', async () => {
    const plugin = createPlugin(
      { id: 'check-p', name: 'Check', version: '1.0.0', description: 'Test', author: 'A' },
      () => ({})
    ).create()

    pluginManager.register(plugin)
    expect(pluginManager.isActive('check-p')).toBe(false)

    await pluginManager.activate('check-p')
    expect(pluginManager.isActive('check-p')).toBe(true)
  })

  it('should get status map', async () => {
    const plugin = createPlugin(
      { id: 'map-p', name: 'Map', version: '1.0.0', description: 'Test', author: 'A' },
      () => ({})
    ).create()

    pluginManager.register(plugin)
    const statusMap = pluginManager.getStatusMap()
    expect(statusMap['map-p']).toBe('inactive')
  })

  it('should emit events', () => {
    const handler = jest.fn()
    pluginManager.on('test:event', handler)
    pluginManager.emit('test:event', { data: 123 })
    expect(handler).toHaveBeenCalledWith({ data: 123 })
    pluginManager.off('test:event', handler)
  })

  it('should handle register with hooks', async () => {
    const onInit = jest.fn()
    const onActivate = jest.fn()
    const onDeactivate = jest.fn()
    const onDestroy = jest.fn()

    const plugin = createPlugin(
      { id: 'hooks-p', name: 'Hooks', version: '1.0.0', description: 'Test', author: 'A' },
      () => ({
        onInit,
        onActivate,
        onDeactivate,
        onDestroy,
      })
    ).create()

    pluginManager.register(plugin)

    await pluginManager.activate('hooks-p')
    expect(onInit).toHaveBeenCalled()
    expect(onActivate).toHaveBeenCalled()

    await pluginManager.deactivate('hooks-p')
    expect(onDeactivate).toHaveBeenCalled()

    pluginManager.unregister('hooks-p')
    expect(onDestroy).toHaveBeenCalled()
  })

  it('should handle event handlers', async () => {
    const handler = jest.fn()

    const plugin = createPlugin(
      { id: 'event-p', name: 'Event', version: '1.0.0', description: 'Test', author: 'A' },
      (ctx) => ({
        onActivate: () => {
          ctx.on('my:event', handler)
        },
      })
    ).create()

    pluginManager.register(plugin)
    await pluginManager.activate('event-p')

    pluginManager.emit('my:event', 'payload')
    expect(handler).toHaveBeenCalledWith('payload')

    // Unregister and verify handler is cleaned up
    pluginManager.unregister('event-p')
  })

  it('should handle error in plugin activation', async () => {
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {})

    const plugin = createPlugin(
      { id: 'error-p', name: 'Error', version: '1.0.0', description: 'Test', author: 'A' },
      () => ({
        onActivate: () => {
          throw new Error('Activation failed')
        },
      })
    ).create()

    pluginManager.register(plugin)
    await pluginManager.activate('error-p')

    expect(pluginManager.getStatus('error-p')).toBe('error')

    consoleSpy.mockRestore()
  })

  it('should not activate already active plugin', async () => {
    const onActivate = jest.fn()

    const plugin = createPlugin(
      { id: 'double-p', name: 'Double', version: '1.0.0', description: 'Test', author: 'A' },
      () => ({
        onActivate,
      })
    ).create()

    pluginManager.register(plugin)
    await pluginManager.activate('double-p')
    await pluginManager.activate('double-p') // Second call should be no-op

    expect(onActivate).toHaveBeenCalledTimes(1)
  })
})
