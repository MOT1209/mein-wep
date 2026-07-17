/**
 * Feature flags for Denkmalen
 * 
 * Usage:
 *   import { FEATURES } from '@/lib/flags'
 *   if (FEATURES.onlineMode) { ... }
 * 
 * To enable a feature, set the env var to 'true' in .env.local:
 *   NEXT_PUBLIC_FEATURE_ONLINE_MODE=true
 */

export const FEATURES = {
  /** Online multiplayer mode (requires Socket.IO server) */
  onlineMode: process.env.NEXT_PUBLIC_FEATURE_ONLINE_MODE === 'true',
  
  /** Leaderboard tab (shows only if there's data) */
  leaderboard: process.env.NEXT_PUBLIC_FEATURE_LEADERBOARD !== 'false',
  
  /** Statistics tab (shows only if there's data) */
  statistics: process.env.NEXT_PUBLIC_FEATURE_STATISTICS !== 'false',

  /** Demo video placeholder in hero — hidden by default */
  demoVideo: process.env.NEXT_PUBLIC_FEATURE_DEMO_VIDEO === 'true',
} as const