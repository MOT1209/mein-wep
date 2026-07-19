'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { pluginManager } from '@/plugin-system/manager'
import { PluginID, PluginStatus } from '@/plugin-system/types'
import { t } from '@/lib/i18n'
import { useGameStore } from '@/store/gameStore'
import { FaArrowLeft, FaPuzzlePiece, FaCheck, FaTimes, FaInfoCircle, FaCog } from 'react-icons/fa'

interface PluginInfo {
  id: PluginID
  name: string
  version: string
  description: string
  status: PluginStatus
  dependencies?: PluginID[]
  optional?: boolean
}

export function PluginManager() {
  const { setPhase, settings } = useGameStore()
  const lang = settings.language
  const [plugins, setPlugins] = useState<PluginInfo[]>([])
  const [selectedPlugin, setSelectedPlugin] = useState<PluginInfo | null>(null)
  const [loading, setLoading] = useState<PluginID | null>(null)

  // Load plugins on mount
  useEffect(() => {
    const loadPlugins = () => {
      const pluginList = pluginManager.listPlugins()
      setPlugins(pluginList.map(p => ({
        ...p,
        description: pluginManager.get(p.id)?.manifest.description || '',
        dependencies: pluginManager.get(p.id)?.manifest.dependencies,
        optional: pluginManager.get(p.id)?.manifest.optional,
      })))
    }
    
    loadPlugins()
    
    // Refresh every second to catch status changes
    const interval = setInterval(loadPlugins, 1000)
    return () => clearInterval(interval)
  }, [])

  const handleToggle = async (plugin: PluginInfo) => {
    if (loading) return
    
    setLoading(plugin.id)
    
    try {
      if (plugin.status === 'active') {
        await pluginManager.deactivate(plugin.id)
      } else {
        await pluginManager.activate(plugin.id)
      }
    } catch (error) {
      console.error(`Failed to toggle plugin ${plugin.id}:`, error)
    } finally {
      setLoading(null)
    }
  }

  const getStatusColor = (status: PluginStatus) => {
    switch (status) {
      case 'active': return 'bg-green-500'
      case 'inactive': return 'bg-slate-400'
      case 'error': return 'bg-red-500'
      case 'loading': return 'bg-yellow-500'
      default: return 'bg-slate-400'
    }
  }

  const getStatusText = (status: PluginStatus) => {
    switch (status) {
      case 'active': return t('plugins.status.active', lang)
      case 'inactive': return t('plugins.status.inactive', lang)
      case 'error': return t('plugins.status.error', lang)
      case 'loading': return t('plugins.status.loading', lang)
      default: return status
    }
  }

  const getPluginIcon = (id: PluginID) => {
    const icons: Record<PluginID, string> = {
      ai: '🤖',
      challenges: '⚡',
      cosmetics: '🎨',
      replay: '📹',
      tournaments: '🏆',
      teams: '👥',
      statistics: '📊',
      audio: '🔊',
      community: '👥',
      settings: '⚙️',
    }
    return icons[id] || '🔌'
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="min-h-screen flex flex-col p-4"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => { setPhase('settings') }}
          className="p-3 bg-white dark:bg-slate-800 rounded-xl shadow-lg"
          aria-label={t('common.back', lang)}
        >
          <FaArrowLeft className="text-xl text-slate-700 dark:text-white" />
        </motion.button>
        
        <div className="text-center">
          <h1 className="text-2xl font-bold text-slate-800 dark:text-white flex items-center gap-2">
            <FaPuzzlePiece className="text-purple-500" />
            {t('plugins.title', lang)}
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            {t('plugins.subtitle', lang)}
          </p>
        </div>
        
        <div className="w-12" />
      </div>

      {/* Plugin List */}
      <div className="flex-1 max-w-lg mx-auto w-full space-y-3">
        {plugins.map((plugin) => (
          <motion.div
            key={plugin.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className={`bg-white dark:bg-slate-800 rounded-2xl p-4 shadow-lg border-2 transition-all ${
              selectedPlugin?.id === plugin.id
                ? 'border-primary-500'
                : 'border-transparent hover:border-slate-200 dark:hover:border-slate-700'
            }`}
          >
            <div className="flex items-center gap-4">
              {/* Plugin Icon */}
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary-400 to-secondary-400 flex items-center justify-center text-2xl shadow-md">
                {getPluginIcon(plugin.id)}
              </div>
              
              {/* Plugin Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h3 className="font-bold text-slate-800 dark:text-white truncate">
                    {plugin.name}
                  </h3>
                  <span className="text-xs text-slate-500 dark:text-slate-400">
                    v{plugin.version}
                  </span>
                </div>
                <p className="text-sm text-slate-500 dark:text-slate-400 truncate">
                  {plugin.description}
                </p>
                
                {/* Status Badge */}
                <div className="flex items-center gap-2 mt-1">
                  <span className={`w-2 h-2 rounded-full ${getStatusColor(plugin.status)}`} />
                  <span className="text-xs text-slate-500 dark:text-slate-400">
                    {getStatusText(plugin.status)}
                  </span>
                  
                  {plugin.dependencies && plugin.dependencies.length > 0 && (
                    <span className="text-xs text-slate-400 dark:text-slate-500">
                      • Depends on: {plugin.dependencies.join(', ')}
                    </span>
                  )}
                </div>
              </div>
              
              {/* Toggle Button */}
              <div className="flex items-center gap-2">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setSelectedPlugin(plugin)}
                  className="p-2 text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
                  aria-label="Plugin info"
                >
                  <FaInfoCircle />
                </motion.button>
                
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => handleToggle(plugin)}
                  disabled={loading === plugin.id || plugin.optional === false}
                  className={`px-4 py-2 rounded-xl font-medium text-sm transition-all ${
                    plugin.status === 'active'
                      ? 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 hover:bg-green-200 dark:hover:bg-green-900/50'
                      : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-600'
                  } ${loading === plugin.id ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  {loading === plugin.id ? (
                    <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                  ) : plugin.status === 'active' ? (
                    <FaCheck className="inline" />
                  ) : (
                    <FaTimes className="inline" />
                  )}
                </motion.button>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Plugin Details Modal */}
      <AnimatePresence>
        {selectedPlugin && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
            onClick={() => setSelectedPlugin(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white dark:bg-slate-800 rounded-2xl p-6 w-full max-w-md shadow-2xl"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary-400 to-secondary-400 flex items-center justify-center text-2xl">
                  {getPluginIcon(selectedPlugin.id)}
                </div>
                <div>
                  <h3 className="text-xl font-bold text-slate-800 dark:text-white">
                    {selectedPlugin.name}
                  </h3>
                  <p className="text-sm text-slate-500 dark:text-slate-400">
                    v{selectedPlugin.version}
                  </p>
                </div>
              </div>
              
              <p className="text-slate-600 dark:text-slate-300 mb-4">
                {selectedPlugin.description}
              </p>
              
              <div className="space-y-2 mb-6">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-500 dark:text-slate-400">Status:</span>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    selectedPlugin.status === 'active'
                      ? 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400'
                      : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-400'
                  }`}>
                    {getStatusText(selectedPlugin.status)}
                  </span>
                </div>
                
                {selectedPlugin.dependencies && selectedPlugin.dependencies.length > 0 && (
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-500 dark:text-slate-400">Dependencies:</span>
                    <span className="text-slate-700 dark:text-slate-300">
                      {selectedPlugin.dependencies.join(', ')}
                    </span>
                  </div>
                )}
                
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-500 dark:text-slate-400">Required:</span>
                  <span className="text-slate-700 dark:text-slate-300">
                    {selectedPlugin.optional ? 'No' : 'Yes'}
                  </span>
                </div>
              </div>
              
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setSelectedPlugin(null)}
                className="w-full py-3 bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-white font-bold rounded-xl"
              >
                {t('common.close', lang)}
              </motion.button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}
