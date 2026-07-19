import { createPlugin } from '@/plugin-system/base'
import { pluginManager } from '@/plugin-system/manager'

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
      votes: [],
      aiEvaluations: {},
    })),
    setState: jest.fn(),
    subscribe: jest.fn(),
  },
}))

describe('Plugin System', () => {
  beforeEach(() => {
    // Clear all plugins before each test
    pluginManager.listPlugins().forEach(p => {
      pluginManager.unregister(p.id)
    })
  })

  describe('createPlugin', () => {
    it('should create a plugin factory', () => {
      const pluginFactory = createPlugin(
        {
          id: 'test-plugin',
          name: 'Test Plugin',
          version: '1.0.0',
          description: 'A test plugin',
          author: 'Test Author',
        },
        (ctx, config) => ({
          onInit: jest.fn(),
          onActivate: jest.fn(),
          onDeactivate: jest.fn(),
        })
      )

      expect(pluginFactory).toBeDefined()
      expect(pluginFactory.create).toBeDefined()
    })

    it('should create a plugin from factory', () => {
      const pluginFactory = createPlugin(
        {
          id: 'test-plugin',
          name: 'Test Plugin',
          version: '1.0.0',
          description: 'A test plugin',
          author: 'Test Author',
        },
        (ctx, config) => ({
          onInit: jest.fn(),
          onActivate: jest.fn(),
          onDeactivate: jest.fn(),
        })
      )

      const plugin = pluginFactory.create()
      
      expect(plugin).toBeDefined()
      expect(plugin.manifest.id).toBe('test-plugin')
      expect(plugin.manifest.name).toBe('Test Plugin')
      expect(plugin.manifest.version).toBe('1.0.0')
    })

    it('should call lifecycle hooks', () => {
      const onInit = jest.fn()
      const onActivate = jest.fn()
      const onDeactivate = jest.fn()
      const onDestroy = jest.fn()

      const pluginFactory = createPlugin(
        {
          id: 'test-plugin',
          name: 'Test Plugin',
          version: '1.0.0',
          description: 'A test plugin',
          author: 'Test Author',
        },
        (ctx, config) => ({
          onInit,
          onActivate,
          onDeactivate,
          onDestroy,
        })
      )

      const plugin = pluginFactory.create()

      // Test lifecycle
      plugin.onInit?.()
      expect(onInit).toHaveBeenCalled()

      plugin.onActivate?.()
      expect(onActivate).toHaveBeenCalled()

      plugin.onDeactivate?.()
      expect(onDeactivate).toHaveBeenCalled()

      plugin.onDestroy?.()
      expect(onDestroy).toHaveBeenCalled()
    })
  })

  describe('PluginManager', () => {
    it('should register plugins', () => {
      const pluginFactory = createPlugin(
        {
          id: 'test-plugin',
          name: 'Test Plugin',
          version: '1.0.0',
          description: 'A test plugin',
          author: 'Test Author',
        },
        (ctx, config) => ({
          onInit: jest.fn(),
        })
      )

      const plugin = pluginFactory.create()
      pluginManager.register(plugin)
      
      const plugins = pluginManager.listPlugins()
      expect(plugins).toHaveLength(1)
      expect(plugins[0].id).toBe('test-plugin')
    })

    it('should not register duplicate plugins', () => {
      const pluginFactory1 = createPlugin(
        {
          id: 'test-plugin',
          name: 'Test Plugin',
          version: '1.0.0',
          description: 'A test plugin',
          author: 'Test Author',
        },
        (ctx, config) => ({})
      )

      const pluginFactory2 = createPlugin(
        {
          id: 'test-plugin',
          name: 'Test Plugin 2',
          version: '2.0.0',
          description: 'Another test plugin',
          author: 'Test Author 2',
        },
        (ctx, config) => ({})
      )

      const plugin1 = pluginFactory1.create()
      const plugin2 = pluginFactory2.create()
      
      pluginManager.register(plugin1)
      pluginManager.register(plugin2)
      
      const plugins = pluginManager.listPlugins()
      expect(plugins).toHaveLength(1)
    })

    it('should activate and deactivate plugins', async () => {
      const onActivate = jest.fn()
      const onDeactivate = jest.fn()

      const pluginFactory = createPlugin(
        {
          id: 'test-plugin',
          name: 'Test Plugin',
          version: '1.0.0',
          description: 'A test plugin',
          author: 'Test Author',
        },
        (ctx, config) => ({
          onActivate,
          onDeactivate,
        })
      )

      const plugin = pluginFactory.create()
      pluginManager.register(plugin)
      await pluginManager.activate('test-plugin')
      
      expect(onActivate).toHaveBeenCalled()
      expect(pluginManager.getStatus('test-plugin')).toBe('active')

      await pluginManager.deactivate('test-plugin')
      
      expect(onDeactivate).toHaveBeenCalled()
      expect(pluginManager.getStatus('test-plugin')).toBe('inactive')
    })

    it('should unregister plugins', () => {
      const onDestroy = jest.fn()

      const pluginFactory = createPlugin(
        {
          id: 'test-plugin',
          name: 'Test Plugin',
          version: '1.0.0',
          description: 'A test plugin',
          author: 'Test Author',
        },
        (ctx, config) => ({
          onDestroy,
        })
      )

      const plugin = pluginFactory.create()
      pluginManager.register(plugin)
      pluginManager.unregister('test-plugin')
      
      expect(onDestroy).toHaveBeenCalled()
      expect(pluginManager.get('test-plugin')).toBeUndefined()
    })

    it('should emit events to active plugins', async () => {
      const handler = jest.fn()

      const pluginFactory = createPlugin(
        {
          id: 'test-plugin',
          name: 'Test Plugin',
          version: '1.0.0',
          description: 'A test plugin',
          author: 'Test Author',
        },
        (ctx, config) => ({
          onActivate: () => {
            ctx.on('game:start', handler)
          },
        })
      )

      const plugin = pluginFactory.create()
      pluginManager.register(plugin)
      await pluginManager.activate('test-plugin')
      
      // Emit event
      pluginManager.emit('game:start', { mode: 'offline' })
      
      expect(handler).toHaveBeenCalledWith({ mode: 'offline' })
    })

    it('should not emit events to inactive plugins', async () => {
      const handler = jest.fn()

      const pluginFactory = createPlugin(
        {
          id: 'test-plugin',
          name: 'Test Plugin',
          version: '1.0.0',
          description: 'A test plugin',
          author: 'Test Author',
        },
        (ctx, config) => ({
          onActivate: () => {
            ctx.on('game:start', handler)
          },
        })
      )

      const plugin = pluginFactory.create()
      pluginManager.register(plugin)
      // Don't activate
      
      pluginManager.emit('game:start', { mode: 'offline' })
      
      expect(handler).not.toHaveBeenCalled()
    })

    it('should get plugin status', async () => {
      const pluginFactory = createPlugin(
        {
          id: 'test-plugin',
          name: 'Test Plugin',
          version: '1.0.0',
          description: 'A test plugin',
          author: 'Test Author',
        },
        (ctx, config) => ({})
      )

      const plugin = pluginFactory.create()
      pluginManager.register(plugin)
      
      expect(pluginManager.getStatus('test-plugin')).toBe('inactive')
      
      await pluginManager.activate('test-plugin')
      
      expect(pluginManager.getStatus('test-plugin')).toBe('active')
    })

    it('should list all plugins', () => {
      const pluginFactory1 = createPlugin(
        {
          id: 'plugin-1',
          name: 'Plugin 1',
          version: '1.0.0',
          description: 'First plugin',
          author: 'Author 1',
        },
        (ctx, config) => ({})
      )

      const pluginFactory2 = createPlugin(
        {
          id: 'plugin-2',
          name: 'Plugin 2',
          version: '2.0.0',
          description: 'Second plugin',
          author: 'Author 2',
        },
        (ctx, config) => ({})
      )

      const plugin1 = pluginFactory1.create()
      const plugin2 = pluginFactory2.create()
      
      pluginManager.register(plugin1)
      pluginManager.register(plugin2)
      
      const plugins = pluginManager.listPlugins()
      expect(plugins).toHaveLength(2)
      expect(plugins.map(p => p.id)).toContain('plugin-1')
      expect(plugins.map(p => p.id)).toContain('plugin-2')
    })
  })
})
