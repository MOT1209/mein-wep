import { v4 as uuidv4 } from 'uuid'

// Generate UUID
export function generateId(): string {
  return uuidv4()
}

// Generate room code
export function generateRoomCode(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
  let code = ''
  for (let i = 0; i < 6; i++) {
    code += chars[Math.floor(Math.random() * chars.length)]
  }
  return code
}

// Calculate score based on rank
export function calculateScore(rank: number): number {
  switch (rank) {
    case 1: return 10
    case 2: return 7
    case 3: return 5
    default: return 2
  }
}

// Format time
export function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60)
  const secs = seconds % 60
  return `${mins}:${secs.toString().padStart(2, '0')}`
}

// Format number
export function formatNumber(num: number): string {
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1) + 'M'
  }
  if (num >= 1000) {
    return (num / 1000).toFixed(1) + 'K'
  }
  return num.toString()
}

// Deep clone
export function deepClone<T>(obj: T): T {
  return JSON.parse(JSON.stringify(obj))
}

// Debounce
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null
  
  return (...args: Parameters<T>) => {
    if (timeout) {
      clearTimeout(timeout)
    }
    timeout = setTimeout(() => func(...args), wait)
  }
}

// Throttle
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean = false
  
  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args)
      inThrottle = true
      setTimeout(() => (inThrottle = false), limit)
    }
  }
}

// Shuffle array
export function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array]
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
  }
  return shuffled
}

// Random item from array
export function randomItem<T>(array: T[]): T {
  return array[Math.floor(Math.random() * array.length)]
}

// Hex to RGB
export function hexToRgb(hex: string): { r: number; g: number; b: number } {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
  return result
    ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16),
      }
    : { r: 0, g: 0, b: 0 }
}

// RGB to Hex
export function rgbToHex(r: number, g: number, b: number): string {
  return '#' + [r, g, b].map(x => {
    const hex = x.toString(16)
    return hex.length === 1 ? '0' + hex : hex
  }).join('')
}

// Canvas to data URL
export function canvasToDataUrl(canvas: HTMLCanvasElement): string {
  return canvas.toDataURL('image/png')
}

// Data URL to Image
export function dataUrlToImage(dataUrl: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () => resolve(img)
    img.onerror = reject
    img.src = dataUrl
  })
}

// Local storage helpers
export const storage = {
  get: <T>(key: string, defaultValue: T): T => {
    if (typeof window === 'undefined') return defaultValue
    try {
      const item = localStorage.getItem(key)
      return item ? JSON.parse(item) : defaultValue
    } catch {
      return defaultValue
    }
  },
  set: <T>(key: string, value: T): void => {
    if (typeof window === 'undefined') return
    try {
      localStorage.setItem(key, JSON.stringify(value))
    } catch {
      console.error('Failed to save to localStorage')
    }
  },
  remove: (key: string): void => {
    if (typeof window === 'undefined') return
    try {
      localStorage.removeItem(key)
    } catch {
      console.error('Failed to remove from localStorage')
    }
  },
}

// Sound effects
export type SoundEffect = 
  | 'click' 
  | 'success' 
  | 'error' 
  | 'countdown' 
  | 'end' 
  | 'winner' 
  | 'vote'

let audioContext: AudioContext | null = null

function getAudioContext(): AudioContext {
  if (!audioContext) {
    audioContext = new (window.AudioContext || (window as any).webkitAudioContext)()
  }
  return audioContext
}

function playTone(frequency: number, duration: number, type: OscillatorType = 'sine') {
  const ctx = getAudioContext()
  
  // Resume if suspended (for mobile browsers)
  if (ctx.state === 'suspended') {
    ctx.resume()
  }
  
  const oscillator = ctx.createOscillator()
  const gainNode = ctx.createGain()
  
  oscillator.connect(gainNode)
  gainNode.connect(ctx.destination)
  
  oscillator.frequency.value = frequency
  oscillator.type = type
  
  gainNode.gain.setValueAtTime(0.3, ctx.currentTime)
  gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + duration)
  
  oscillator.start(ctx.currentTime)
  oscillator.stop(ctx.currentTime + duration)
}

export function playSound(effect: SoundEffect) {
  try {
    switch (effect) {
      case 'click':
        playTone(800, 0.1)
        break
      case 'success':
        playTone(523, 0.1)
        setTimeout(() => playTone(659, 0.1), 100)
        setTimeout(() => playTone(784, 0.2), 200)
        break
      case 'error':
        playTone(200, 0.3, 'sawtooth')
        break
      case 'countdown':
        playTone(440, 0.1)
        break
      case 'end':
        playTone(784, 0.1)
        setTimeout(() => playTone(659, 0.1), 100)
        setTimeout(() => playTone(523, 0.2), 200)
        break
      case 'winner':
        playTone(523, 0.15)
        setTimeout(() => playTone(659, 0.15), 150)
        setTimeout(() => playTone(784, 0.15), 300)
        setTimeout(() => playTone(1047, 0.3), 450)
        break
      case 'vote':
        playTone(600, 0.1)
        break
    }
  } catch (error) {
    console.error('Failed to play sound:', error)
  }
}

// Vibration
export function vibrate(pattern: number | number[] = 50): void {
  if (!navigator.vibrate) return
  navigator.vibrate(pattern)
}

// Share API
export async function shareContent(data: {
  title: string
  text: string
  url?: string
}): Promise<boolean> {
  if (!navigator.share) {
    // Fallback: copy to clipboard
    try {
      await navigator.clipboard.writeText(`${data.text}\n${data.url || ''}`)
      return true
    } catch {
      return false
    }
  }
  
  try {
    await navigator.share(data)
    return true
  } catch {
    return false
  }
}

// Download file
export function downloadFile(dataUrl: string, filename: string): void {
  const link = document.createElement('a')
  link.href = dataUrl
  link.download = filename
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}
