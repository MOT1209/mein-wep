'use client'

import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { FaWifi } from 'react-icons/fa'
import { useGameStore } from '@/store/gameStore'
import { t } from '@/lib/i18n'

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

  useEffect(() => {
    if (!('serviceWorker' in navigator)) return

    // Registration is deferred to load so it never competes with the first
    // paint or the font/asset requests the page needs to become interactive.
    const register = () => {
      navigator.serviceWorker
        .register(`${BASE}/sw.js`, { scope: `${BASE}/` })
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
            <FaWifi className="opacity-70" />
            {t('pwa.offlineBadge', settings.language)}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
