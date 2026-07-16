'use client'

import { Component, ReactNode } from 'react'
import { motion } from 'framer-motion'
import { FaExclamationTriangle, FaRedo } from 'react-icons/fa'
import { useGameStore } from '@/store/gameStore'
import { t } from '@/lib/i18n'

interface Props {
  children: ReactNode
  fallback?: ReactNode
}

interface State {
  hasError: boolean
  error: Error | null
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: any) {
    // Log error to console in development
    console.error('[ErrorBoundary] Caught error:', error)
    console.error('[ErrorBoundary] Component stack:', errorInfo.componentStack)
    
    // In production, you could send to an error reporting service
    // Example: Sentry.captureException(error, { extra: errorInfo })
    
    // Store error info for debugging
    this.setState({ error })
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback
      }

      const lang = useGameStore.getState().settings.language

      return (
        <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-primary-50 via-white to-secondary-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="max-w-md w-full bg-white dark:bg-slate-800 rounded-2xl shadow-2xl p-8 text-center"
          >
            <motion.div
              animate={{ 
                rotate: [0, -10, 10, -10, 10, 0],
                scale: [1, 1.1, 1]
              }}
              transition={{ duration: 0.5 }}
              className="w-20 h-20 mx-auto mb-6 bg-red-100 dark:bg-red-900/30 rounded-full 
                         flex items-center justify-center"
            >
              <FaExclamationTriangle className="text-4xl text-red-500" />
            </motion.div>

            <h2 className="text-2xl font-bold text-slate-800 dark:text-white mb-2">
              {t('error.title', lang)}
            </h2>

            <p className="text-slate-600 dark:text-slate-400 mb-6">
              {t('error.message', lang)}
            </p>

            {process.env.NODE_ENV === 'development' && this.state.error && (
              <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 rounded-xl text-left">
                <p className="text-sm font-mono text-red-600 dark:text-red-400 break-all">
                  {this.state.error.message}
                </p>
              </div>
            )}

            <div className="flex gap-3 justify-center">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => this.setState({ hasError: false, error: null })}
                className="px-6 py-3 bg-gradient-to-r from-primary-500 to-secondary-500 
                           text-white font-bold rounded-xl shadow-lg flex items-center gap-2"
              >
                <FaRedo />
                {t('error.tryAgain', lang)}
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => window.location.href = '/'}
                className="px-6 py-3 bg-slate-200 dark:bg-slate-700
                           text-slate-700 dark:text-white font-bold rounded-xl"
              >
                {t('error.goHome', lang)}
              </motion.button>
            </div>
          </motion.div>
        </div>
      )
    }

    return this.props.children
  }
}
