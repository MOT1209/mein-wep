'use client'

import { useEffect, useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { FaWifi, FaWifiOff, FaSync } from 'react-icons/fa'
import { useGameStore } from '@/store/gameStore'
import { t } from '@/lib/i18n'
import { preloadDefaultWords, getStorageUsageFormatted } from '@/lib/offline-storage'

// Kept in sync with basePath in next.config.js and BASE in public/sw.js.
const BASE = '/denkmalen'

/**
 * Registers the service worker that makes the game playable with no network,
 * and surfaces a badge while the connection is down so players understand why
 * online mode is unavailable.
 */
export function ServiceWorkerProvider({ children }: { children: React.ReactNode }) {
  const { settings } = useGameStore()
  const [isOffline, setIsOffline] = useState(false)
  const [swUpdateAvailable, setSwUpdateAvailable] = useState(false)
  const [storageInfo, setStorageInfo] = useState<string>('')

  // Preload default words on mount
  useEffect(() => {
    preloadDefaultWords()
    setStorageInfo(getStorageUsageFormatted())
  }, [])

  useEffect(() => {
    if (!('serviceWorker' in navigator)) return

    // Registration is deferred to load so it never competes with the first
    // paint or the font/asset requests the page needs to become interactive.
    const register = () => {
      navigator.serviceWorker
        .register(`${BASE}/sw.js`, { scope: `${BASE}/` })
        .then((registration) => {
          // Check for updates periodically
          setInterval(() => {
            registration.update()
          }, 60 * 60 * 1000) // Check every hour

          // Listen for updates
          registration.addEventListener('updatefound', () => {
            const newWorker = registration.installing
            if (newWorker) {
              newWorker.addEventListener('statechange', () => {
                if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                  setSwUpdateAvailable(true)
                }
              })
            }
          })
        })
        .catch((err) => console.error('[SW] Registration failed:', err))
    }

    if (document.readyState === 'complete') {
      register()
    } else {
      window.addEventListener('load', register)
      return () => window.removeEventListener('load', register)
    }
  }, [])

  useEffect(() => {
    const update = () => setIsOffline(!navigator.onLine)

    update()
    window.addEventListener('online', update)
    window.addEventListener('offline', update)

    return () => {
      window.removeEventListener('online', update)
      window.removeEventListener('offline', update)
    }
  }, [])

  const handleUpdate = () => {
    window.location.reload()
  }

  return (
    <>
      {children}
      <AnimatePresence>
        {isOffline && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            role="status"
            aria-live="polite"
            className="fixed top-3 left-1/2 -translate-x-1/2 z-[100] flex items-center gap-2
                       px-4 py-2 rounded-full bg-amber-500 text-white text-sm font-bold shadow-lg"
          >
            <FaWifiOff className="opacity-70" />
            {t('pwa.offlineBadge', settings.language)}
          </motion.div>
        )}
      </AnimatePresence>

      {/* SW Update Available */}
      <AnimatePresence>
        {swUpdateAvailable && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="fixed bottom-3 left-1/2 -translate-x-1/2 z-[100] flex items-center gap-3
                       px-4 py-3 rounded-2xl bg-primary-500 text-white text-sm font-bold shadow-lg"
          >
            <FaSync className="animate-spin" />
            <span>Update available!</span>
            <button
              onClick={handleUpdate}
              className="px-3 py-1 bg-white/20 rounded-lg hover:bg-white/30 transition-colors"
            >
              Reload
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
