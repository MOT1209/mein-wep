// ═══════════════════════════════════════════════════════════════════════════════
// Sketch Battle AI — Challenge Registry
// Centralized registry for all game challenges
// ═══════════════════════════════════════════════════════════════════════════════

import { Challenge, ChallengeID, ChallengeCategory, ChallengeContext, ChallengeState } from './types'

class ChallengeRegistry {
  private challenges = new Map<ChallengeID, Challenge>()
  
  // ─── Registration ───────────────────────────────────────────────────────
  
  register(challenge: Challenge): void {
    if (this.challenges.has(challenge.id)) {
      console.warn(`[ChallengeRegistry] Challenge "${challenge.id}" already registered, replacing...`)
    }
    
    this.challenges.set(challenge.id, challenge)
    console.log(`[ChallengeRegistry] Registered: ${challenge.name}`)
  }
  
  unregister(id: ChallengeID): void {
    this.challenges.delete(id)
    console.log(`[ChallengeRegistry] Unregistered: ${id}`)
  }
  
  // ─── Getters ────────────────────────────────────────────────────────────
  
  get(id: ChallengeID): Challenge | undefined {
    return this.challenges.get(id)
  }
  
  getAll(): Challenge[] {
    return Array.from(this.challenges.values())
  }
  
  getByCategory(category: ChallengeCategory): Challenge[] {
    return this.getAll().filter(c => c.category === category)
  }
  
  getAvailable(context: ChallengeContext): Challenge[] {
    return this.getAll().filter(challenge => {
      if (challenge.canApply) {
        return challenge.canApply(context)
      }
      return true
    })
  }
  
  // ─── Selection ──────────────────────────────────────────────────────────
  
  /** Get a random challenge for the given context */
  getRandom(context: ChallengeContext): Challenge | null {
    const available = this.getAvailable(context)
    if (available.length === 0) return null
    
    const index = Math.floor(Math.random() * available.length)
    return available[index]
  }
  
  /** Get challenges compatible with given difficulty rating */
  getByDifficulty(maxDifficulty: number): Challenge[] {
    return this.getAll().filter(c => c.difficulty <= maxDifficulty)
  }
  
  // ─── Execution ──────────────────────────────────────────────────────────
  
  applyChallenge(id: ChallengeID, context: ChallengeContext): Partial<ChallengeContext> | null {
    const challenge = this.get(id)
    if (!challenge) {
      console.error(`[ChallengeRegistry] Challenge "${id}" not found`)
      return null
    }
    
    if (challenge.canApply && !challenge.canApply(context)) {
      console.warn(`[ChallengeRegistry] Challenge "${id}" cannot be applied to current context`)
      return null
    }
    
    return challenge.apply(context)
  }
  
  async checkChallenge(
    id: ChallengeID, 
    data: { drawingData?: string; context: ChallengeContext; state: ChallengeState }
  ): Promise<boolean> {
    const challenge = this.get(id)
    if (!challenge) {
      console.error(`[ChallengeRegistry] Challenge "${id}" not found`)
      return false
    }
    
    try {
      return await challenge.check(data)
    } catch (err) {
      console.error(`[ChallengeRegistry] Error checking challenge "${id}":`, err)
      return false
    }
  }
  
  // ─── Display ────────────────────────────────────────────────────────────
  
  getHints(id: ChallengeID): string[] {
    const challenge = this.get(id)
    if (!challenge || !challenge.getHints) return []
    return challenge.getHints()
  }
  
  /** Get summary for UI display */
  getSummary(): Array<{
    id: ChallengeID
    name: string
    icon: string
    category: ChallengeCategory
    difficulty: number
    bonusPoints: number
  }> {
    return this.getAll().map(c => ({
      id: c.id,
      name: c.name,
      icon: c.icon,
      category: c.category,
      difficulty: c.difficulty,
      bonusPoints: c.bonusPoints,
    }))
  }
}

// Singleton
export const challengeRegistry = new ChallengeRegistry()
