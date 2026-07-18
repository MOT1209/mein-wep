// ═══════════════════════════════════════════════════════════════════════════════
// Replay Plugin — Record and replay drawing sessions
// ═══════════════════════════════════════════════════════════════════════════════

import { createPlugin } from '@/plugin-system/base'

export interface DrawStep {
  type: 'stroke' | 'clear' | 'fill'
  color: string
  size: number
  points: Array<{ x: number; y: number; pressure?: number }>
  timestamp: number
}

export interface Replay {
  id: string
  word: string
  playerId: string
  steps: DrawStep[]
  duration: number
  createdAt: number
}

let currentReplay: DrawStep[] = []
let isRecording = false
let recordingStart = 0

export default createPlugin(
  { id: 'replay', name: 'Replay', version: '1.0.0', description: 'Record and replay drawings', author: 'Sketch Battle Team' },
  (ctx) => ({
    onActivate: () => {
      ctx.on('game:round:start', () => {
        currentReplay = []
        isRecording = true
        recordingStart = Date.now()
      })
      ctx.on('game:drawing:step', (step: unknown) => {
        if (isRecording) {
          currentReplay.push({ ...(step as DrawStep), timestamp: Date.now() - recordingStart })
        }
      })
      ctx.on('game:round:end', () => {
        isRecording = false
      })
    },
    onDeactivate: () => {
      isRecording = false
      currentReplay = []
    },
  })
)

export const getCurrentReplay = (): DrawStep[] => [...currentReplay]
export const isRecordingActive = (): boolean => isRecording
export const getReplayDuration = (): number => isRecording ? Date.now() - recordingStart : 0
