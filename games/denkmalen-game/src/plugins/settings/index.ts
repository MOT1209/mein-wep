// ═══════════════════════════════════════════════════════════════════════════════
// Settings Plugin — Language, theme, sound, timer, accessibility
// ═══════════════════════════════════════════════════════════════════════════════

import { createPlugin } from '@/plugin-system/base'
import { t, Language } from '@/lib/i18n'

export interface Settings {
  language: Language
  theme: 'light' | 'dark' | 'system'
  sound: boolean
  music: boolean
  vibration: boolean
  drawingTime: number
  rounds: number
  drawingQuality: 'low' | 'medium' | 'high'
}

const DEFAULT_SETTINGS: Settings = {
  language: 'en',
  theme: 'system',
  sound: true,
  music: true,
  vibration: true,
  drawingTime: 60,
  rounds: 3,
  drawingQuality: 'high',
}

let settings: Settings = { ...DEFAULT_SETTINGS }

function loadSettings(): void {
  try {
    const stored = localStorage.getItem('sketch-battle:settings')
    if (stored) settings = { ...DEFAULT_SETTINGS, ...JSON.parse(stored) }
  } catch { /* use defaults */ }
}

function saveSettings(): void {
  localStorage.setItem('sketch-battle:settings', JSON.stringify(settings))
}

export default createPlugin(
  { id: 'settings', name: 'Settings', version: '1.0.0', description: 'App settings', author: 'Sketch Battle Team' },
  (ctx) => ({
    onInit: () => { loadSettings() },
    onActivate: () => {
      // Apply theme on activation
      applyTheme(settings.theme)
    },
  })
)

function applyTheme(theme: string): void {
  if (typeof document === 'undefined') return
  const root = document.documentElement
  if (theme === 'dark' || (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
    root.classList.add('dark')
  } else {
    root.classList.remove('dark')
  }
}

export const getSettings = () => ({ ...settings })
export const updateSettings = (updates: Partial<Settings>) => {
  settings = { ...settings, ...updates }
  saveSettings()
  if (updates.theme) applyTheme(updates.theme)
}
export const getTranslation = (key: string) => t(key, settings.language)
