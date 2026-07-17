'use client'

import { motion } from 'framer-motion'
import { useGameStore } from '@/store/gameStore'
import { useGame } from '@/components/GameProvider'
import { useTheme } from '@/components/ThemeProvider'
import { useAuth } from '@/components/AuthProvider'
import {
  FaArrowLeft, FaMoon, FaSun, FaVolumeUp, FaVolumeMute,
  FaMusic, FaMobileAlt, FaGlobe, FaPalette, FaUser, FaSignOutAlt
} from 'react-icons/fa'
import { t, LANGUAGE_OPTIONS } from '@/lib/i18n'

export function SettingsScreen() {
  const { settings, setSettings, setPhase } = useGameStore()
  const { playSound, vibrate } = useGame()
  const { theme, setTheme, resolvedTheme } = useTheme()
  const { user, loading: authLoading, signIn, signOut } = useAuth()
  const lang = settings.language

  const toggleSetting = (key: keyof typeof settings) => {
    playSound('click')
    vibrate()
    setSettings({ [key]: !settings[key] })
  }

  return (
    <motion.div
      initial={{ opacity: 0, x: 100 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -100 }}
      className="min-h-screen flex flex-col p-4"
    >
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => { playSound('click'); setPhase('menu') }}
          className="p-3 bg-white dark:bg-slate-800 rounded-xl shadow-lg"
        >
          <FaArrowLeft className="text-xl text-slate-700 dark:text-white" />
        </motion.button>
        <h1 className="text-2xl font-bold text-slate-800 dark:text-white">
          {t('settings.title', lang)}
        </h1>
      </div>

      <div className="flex-1 max-w-md mx-auto w-full space-y-4">
        {/* Appearance */}
        <div className="card">
          <h2 className="text-lg font-bold text-slate-800 dark:text-white mb-4 flex items-center gap-2">
            <FaPalette className="text-primary-500" />
            {t('settings.appearance', lang)}
          </h2>

          <div className="space-y-3">
            {/* Dark Mode */}
            <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-700 rounded-xl">
              <div className="flex items-center gap-3">
                {resolvedTheme === 'dark' ? (
                  <FaMoon className="text-xl text-primary-500" />
                ) : (
                  <FaSun className="text-xl text-yellow-500" />
                )}
                <span className="font-medium text-slate-800 dark:text-white">{t('settings.darkMode', lang)}</span>
              </div>
              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={() => {
                  playSound('click')
                  setTheme(resolvedTheme === 'dark' ? 'light' : 'dark')
                }}
                className={`w-14 h-8 rounded-full transition-all ${
                  resolvedTheme === 'dark' 
                    ? 'bg-primary-500' 
                    : 'bg-slate-300'
                }`}
              >
                <motion.div
                  animate={{ x: resolvedTheme === 'dark' ? 24 : 0 }}
                  className="w-6 h-6 bg-white rounded-full shadow-md ml-1"
                />
              </motion.button>
            </div>

            {/* Language */}
            <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-700 rounded-xl">
              <div className="flex items-center gap-3">
                <FaGlobe className="text-xl text-green-500" />
                <span className="font-medium text-slate-800 dark:text-white">{t('settings.language', lang)}</span>
              </div>
              <select
                value={settings.language}
                onChange={(e) => {
                  playSound('click')
                  setSettings({ language: e.target.value as 'en' | 'ar' | 'de' })
                }}
                className="bg-white dark:bg-slate-600 text-slate-800 dark:text-white 
                           px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-500"
              >
                {LANGUAGE_OPTIONS.map((opt) => (
                  <option key={opt.code} value={opt.code}>
                    {opt.flag} {opt.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Sound */}
        <div className="card">
          <h2 className="text-lg font-bold text-slate-800 dark:text-white mb-4 flex items-center gap-2">
            <FaVolumeUp className="text-secondary-500" />
            {t('settings.sound', lang)} & {t('settings.vibration', lang)}
          </h2>

          <div className="space-y-3">
            {/* Sound Effects */}
            <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-700 rounded-xl">
              <div className="flex items-center gap-3">
                {settings.sound ? (
                  <FaVolumeUp className="text-xl text-primary-500" />
                ) : (
                  <FaVolumeMute className="text-xl text-slate-400" />
                )}
                <span className="font-medium text-slate-800 dark:text-white">{t('settings.sound', lang)}</span>
              </div>
              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={() => toggleSetting('sound')}
                className={`w-14 h-8 rounded-full transition-all ${
                  settings.sound 
                    ? 'bg-primary-500' 
                    : 'bg-slate-300'
                }`}
              >
                <motion.div
                  animate={{ x: settings.sound ? 24 : 0 }}
                  className="w-6 h-6 bg-white rounded-full shadow-md ml-1"
                />
              </motion.button>
            </div>

            {/* Music */}
            <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-700 rounded-xl">
              <div className="flex items-center gap-3">
                <FaMusic className={`text-xl ${settings.music ? 'text-secondary-500' : 'text-slate-400'}`} />
                <span className="font-medium text-slate-800 dark:text-white">{t('settings.music', lang)}</span>
              </div>
              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={() => toggleSetting('music')}
                className={`w-14 h-8 rounded-full transition-all ${
                  settings.music 
                    ? 'bg-secondary-500' 
                    : 'bg-slate-300'
                }`}
              >
                <motion.div
                  animate={{ x: settings.music ? 24 : 0 }}
                  className="w-6 h-6 bg-white rounded-full shadow-md ml-1"
                />
              </motion.button>
            </div>

            {/* Vibration */}
            <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-700 rounded-xl">
              <div className="flex items-center gap-3">
                <FaMobileAlt className={`text-xl ${settings.vibration ? 'text-accent-500' : 'text-slate-400'}`} />
                <span className="font-medium text-slate-800 dark:text-white">{t('settings.vibration', lang)}</span>
              </div>
              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={() => toggleSetting('vibration')}
                className={`w-14 h-8 rounded-full transition-all ${
                  settings.vibration 
                    ? 'bg-accent-500' 
                    : 'bg-slate-300'
                }`}
              >
                <motion.div
                  animate={{ x: settings.vibration ? 24 : 0 }}
                  className="w-6 h-6 bg-white rounded-full shadow-md ml-1"
                />
              </motion.button>
            </div>
          </div>
        </div>

        {/* Account */}
        <div className="card">
          <h2 className="text-lg font-bold text-slate-800 dark:text-white mb-4 flex items-center gap-2">
            <FaUser className="text-accent-500" />
            {t('settings.account', lang)}
          </h2>

          <div className="space-y-3">
            {authLoading ? (
              <div className="w-full p-3 bg-slate-50 dark:bg-slate-700 rounded-xl h-16 animate-pulse" />
            ) : user ? (
              <>
                <div className="w-full p-3 bg-slate-50 dark:bg-slate-700 rounded-xl flex items-center gap-3 text-left">
                  {user.user_metadata?.avatar_url ? (
                    <img
                      src={user.user_metadata.avatar_url}
                      alt=""
                      className="w-10 h-10 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-400 to-secondary-400
                                    flex items-center justify-center text-white font-bold">
                      {(user.user_metadata?.full_name || user.email || '?').charAt(0).toUpperCase()}
                    </div>
                  )}
                  <div>
                    <p className="font-medium text-slate-800 dark:text-white">
                      {user.user_metadata?.full_name || user.email}
                    </p>
                    <p className="text-sm text-slate-500 dark:text-slate-400">{t('settings.signedIn', lang)}</p>
                  </div>
                </div>

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => { playSound('click'); vibrate(); signOut() }}
                  className="w-full p-3 bg-white dark:bg-slate-600 border-2 border-slate-200
                             dark:border-slate-500 rounded-xl flex items-center gap-3"
                >
                  <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-500 flex items-center justify-center text-lg text-slate-600 dark:text-white">
                    <FaSignOutAlt />
                  </div>
                  <span className="font-medium text-slate-800 dark:text-white">{t('auth.signOut', lang)}</span>
                </motion.button>
              </>
            ) : (
              <>
                <div className="w-full p-3 bg-slate-50 dark:bg-slate-700 rounded-xl
                                 flex items-center gap-3 text-left">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-400 to-secondary-400
                                  flex items-center justify-center text-white font-bold">
                    G
                  </div>
                  <div>
                    <p className="font-medium text-slate-800 dark:text-white">{t('settings.guest', lang)}</p>
                    <p className="text-sm text-slate-500 dark:text-slate-400">{t('settings.noAccount', lang)}</p>
                  </div>
                </div>

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => { playSound('click'); vibrate(); signIn() }}
                  className="w-full p-3 bg-white dark:bg-slate-600 border-2 border-slate-200
                             dark:border-slate-500 rounded-xl flex items-center gap-3"
                >
                  <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-xl">
                    🔑
                  </div>
                  <span className="font-medium text-slate-800 dark:text-white">{t('settings.signInGoogle', lang)}</span>
                </motion.button>
              </>
            )}
          </div>
        </div>

        {/* About */}
        <div className="card text-center">
          <p className="text-slate-500 dark:text-slate-400 text-sm">
            {t('misc.version', lang)}
          </p>
          <p className="text-slate-400 dark:text-slate-500 text-xs mt-1">
            {t('misc.madeWith', lang)}
          </p>
        </div>
      </div>
    </motion.div>
  )
}
