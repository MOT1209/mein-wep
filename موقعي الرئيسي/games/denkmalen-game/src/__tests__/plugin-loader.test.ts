import { initPlugins, enablePlugin, disablePlugin, togglePlugin, getPluginsStatus, isPluginEnabled } from '@/plugin-system/loader'
import { pluginManager } from '@/plugin-system/manager'

// Mock game store
jest.mock('@/store/gameStore', () => ({
  useGameStore: {
    getState: jest.fn(() => ({
      settings: { language: 'en' },
    })),
  },
}))

// Mock plugin modules
jest.mock('@/plugins/ai/index', () => ({
  default: {
    manifest: { id: 'ai', name: 'AI', version: '1.0.0', description: 'AI Plugin', author: 'Test' },
    onInit: jest.fn(),
    onActivate: jest.fn(),
  },
}))

jest.mock('@/plugins/audio/index', () => ({
  default: {
    manifest: { id: 'audio', name: 'Audio', version: '1.0.0', description: 'Audio Plugin', author: 'Test' },
    onInit: jest.fn(),
    onActivate: jest.fn(),
  },
}))

jest.mock('@/plugins/challenges/index', () => ({
  default: {
    manifest: { id: 'challenges', name: 'Challenges', version: '1.0.0', description: 'Challenges Plugin', author: 'Test' },
    onInit: jest.fn(),
    onActivate: jest.fn(),
  },
}))

describe('Plugin Loader', () => {
  beforeEach(() => {
    pluginManager.listPlugins().forEach(p => {
      pluginManager.unregister(p.id)
    })
  })

  it('should initialize plugins', async () => {
    await initPlugins()
    // Should not throw
  })

  it('should get plugins status', () => {
    const status = getPluginsStatus()
    expect(status).toBeDefined()
  })

  it('should check if plugin is enabled', () => {
    const result = isPluginEnabled('ai')
    expect(typeof result).toBe('boolean')
  })

  it('should enable a plugin', async () => {
    await enablePlugin('ai')
    // Should not throw
  })

  it('should disable a plugin', async () => {
    await disablePlugin('ai')
    // Should not throw
  })

  it('should toggle a plugin', async () => {
    const result = await togglePlugin('ai')
    expect(typeof result).toBe('boolean')
  })
})
