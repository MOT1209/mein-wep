// ═══════════════════════════════════════════════════════════════════════════════
// Sketch Battle AI — Challenges Plugin Types
// ═══════════════════════════════════════════════════════════════════════════════

export type ChallengeID = 
  | 'letter'
  | 'one-color'
  | 'one-line'
  | 'no-eraser'
  | 'speed'
  | 'memory'
  | 'ai'
  | 'funny'

export type ChallengeCategory = 'creative' | 'restrictive' | 'difficulty' | 'fun'

export interface ChallengeContext {
  /** Current game state snapshot */
  gamePhase: string
  currentWord: string
  drawingTime: number
  currentLetter?: string
  selectedCategory?: string
  /** Available colors in the palette */
  availableColors: string[]
  /** Current canvas tool state */
  currentTool: string
  currentColor: string
}

export interface ChallengeState {
  /** Whether this challenge is currently active */
  isActive: boolean
  /** Custom data for the challenge */
  data?: Record<string, unknown>
}

export interface Challenge {
  /** Unique challenge identifier */
  id: ChallengeID
  /** Display name */
  name: string
  /** Description of what the challenge does */
  description: string
  /** Icon/emoji for UI */
  icon: string
  /** Challenge category */
  category: ChallengeCategory
  /** Difficulty rating 1-5 */
  difficulty: number
  /** Points bonus for completing the challenge */
  bonusPoints: number
  
  /**
   * Apply the challenge at round start
   * Returns modified context or null if no changes needed
   */
  apply: (context: ChallengeContext) => Partial<ChallengeContext> | null
  
  /**
   * Check if the challenge was completed
   * Returns true if challenge rules were followed
   */
  check: (data: {
    drawingData?: string
    context: ChallengeContext
    state: ChallengeState
  }) => boolean | Promise<boolean>
  
  /**
   * Optional: Get UI hints for this challenge
   */
  getHints?: () => string[]
  
  /**
   * Optional: Validate if challenge can be applied
   */
  canApply?: (context: ChallengeContext) => boolean
}

export interface ChallengeConfig {
  enabled: boolean
  /** Challenges that cannot be selected together */
  exclusiveWith?: ChallengeID[]
  /** Custom bonus points override */
  bonusPointsOverride?: Partial<Record<ChallengeID, number>>
}

export interface ChallengeResult {
  challengeId: ChallengeID
  completed: boolean
  bonusPoints: number
  timestamp: number
}
