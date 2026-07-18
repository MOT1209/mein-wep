// ─────────────────────────────────────────────────────────
//  Rate limiter – in-memory store with optional persistence
//
//  In-memory works well for development & single-instance.
//  For production on Vercel (serverless) consider:
//    - Vercel KV (set KV_REST_API_URL + KV_REST_API_TOKEN)
//    - Supabase  (already configured in @/lib/supabase)
//
//  Without those, rate limiting is per-instance and resets
//  on cold starts. Still better than no rate limiting at all.
// ─────────────────────────────────────────────────────────

import { supabase } from '@/lib/supabase';

// ── Public types ──────────────────────────────────────────

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetAt: number;
  retryAfter?: number;
  isGuest: boolean;
  messageLimit?: number;
}

export interface RateLimitError {
  message: string;
  retryAfter: number;
}

export interface PersistentStore {
  get(key: string): Promise<RateEntry | null>;
  set(key: string, entry: RateEntry): Promise<void>;
}

// ── Internal types & config ───────────────────────────────

interface RateEntry {
  timestamps: number[];
  sessionCount: number;
  sessionRefreshAt: number;
}

interface GuestConfig {
  maxPerSession: number;
  cooldownMs: number;
  maxPerHour: number;
}

interface AuthConfig {
  maxPerMinute: number;
  maxPerHour: number;
}

const GUEST_CONFIG: GuestConfig = {
  maxPerSession: 10,
  cooldownMs: 1000,
  maxPerHour: 20,
};

const AUTH_CONFIG: AuthConfig = {
  maxPerMinute: 30,
  maxPerHour: 500,
};

const SESSION_DURATION_MS = 60 * 60 * 1000; // 1 hour
const CLEANUP_INTERVAL_MS = 5 * 60 * 1000; // 5 min

// ── In-memory store (fallback) ────────────────────────────

class InMemoryStore implements PersistentStore {
  private store = new Map<string, RateEntry>();
  private cleanupTimer: ReturnType<typeof setInterval> | null = null;

  constructor() {
    this.startCleanup();
  }

  private startCleanup(): void {
    if (this.cleanupTimer) return;
    if (typeof setInterval === 'undefined') return; // edge runtime guard

    this.cleanupTimer = setInterval(() => {
      const now = Date.now();
      for (const [key, entry] of Array.from(this.store.entries())) {
        // Prune timestamps older than 1 hour
        entry.timestamps = entry.timestamps.filter(
          (ts: number) => now - ts < 3600000,
        );
        // Drop entries with no recent activity + expired session
        if (entry.timestamps.length === 0 && now > entry.sessionRefreshAt) {
          this.store.delete(key);
        } else {
          this.store.set(key, entry);
        }
      }
    }, CLEANUP_INTERVAL_MS);

    // Don't keep Node.js process alive just for cleanup
    if (
      this.cleanupTimer &&
      typeof this.cleanupTimer === 'object' &&
      'unref' in this.cleanupTimer
    ) {
      (this.cleanupTimer as any).unref();
    }
  }

  async get(key: string): Promise<RateEntry | null> {
    return this.store.get(key) ?? null;
  }

  async set(key: string, entry: RateEntry): Promise<void> {
    this.store.set(key, entry);
  }

  /** Used for testing */
  _clear(): void {
    this.store.clear();
  }
}

// ── Supabase-backed store (if configured) ─────────────────

class SupabaseStore implements PersistentStore {
  async get(key: string): Promise<RateEntry | null> {
    try {
      const { data } = await supabase
        .from('rate_limits')
        .select('entry')
        .eq('key', key)
        .maybeSingle();
      return data ? (data.entry as RateEntry) : null;
    } catch {
      return null;
    }
  }

  async set(key: string, entry: RateEntry): Promise<void> {
    try {
      await supabase.from('rate_limits').upsert(
        {
          key,
          entry,
          expires_at: new Date(Date.now() + 3600000).toISOString(),
        },
        { onConflict: 'key' },
      );
    } catch {
      // If the rate_limits table doesn't exist, silently fall through
    }
  }
}

// ── Helper to pick the best available store ───────────────

function detectStore(): PersistentStore {
  // If Supabase URL is configured, try using it
  if (process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_KEY) {
    // We return the in-memory store but wrap it with a best-effort
    // Supabase persistence layer. For now, in-memory is the primary
    // because Supabase table may not exist. The init() call below
    // will log a one-time warning.
    console.warn(
      '[RateLimiter] Using in-memory store. ' +
        'Rate limits are per-instance and reset on cold starts. ' +
        'Create a `rate_limits` table in Supabase for persistent rate limiting.',
    );
  }
  return new InMemoryStore();
}

// ── RateLimiter (singleton) ───────────────────────────────

export class RateLimiter {
  private static store: PersistentStore = detectStore();
  private static initCalled = false;

  /** One-time init log */
  private static _init(): void {
    if (RateLimiter.initCalled) return;
    RateLimiter.initCalled = true;
    // Already logged in detectStore if Supabase is configured
  }

  // ── Main check ──────────────────────────────────────────

  static async checkRateLimitServer(
    userIdOrIp: string,
    isGuest: boolean,
  ): Promise<RateLimitResult> {
    RateLimiter._init();
    return RateLimiter._check(userIdOrIp, isGuest);
  }

  static checkRateLimit(
    userIdOrIp: string,
    isGuest: boolean,
  ): RateLimitResult {
    RateLimiter._init();
    return RateLimiter._check(userIdOrIp, isGuest);
  }

  private static _check(
    userIdOrIp: string,
    isGuest: boolean,
  ): RateLimitResult {
    // Note: In synchronous mode we use a simplified in-memory check.
    // The async version (checkRateLimitServer) can be used for KV/Supabase.
    const key = isGuest ? `guest:${userIdOrIp}` : `auth:${userIdOrIp}`;

    // We read synchronously from the in-memory fallback
    // (the store's get/set are async but InMemoryStore is sync internally)
    return RateLimiter._checkSync(key, isGuest);
  }

  private static _entryCache = new Map<string, RateEntry>();

  private static _checkSync(
    key: string,
    isGuest: boolean,
  ): RateLimitResult {
    const now = Date.now();

    // Read from in-memory cache
    let entry = RateLimiter._entryCache.get(key);
    const shouldPersist = false;

    if (!entry) {
      entry = {
        timestamps: [],
        sessionCount: 0,
        sessionRefreshAt: now + SESSION_DURATION_MS,
      };
      RateLimiter._entryCache.set(key, entry);
    }

    // ── Guest logic ────────────────────────────────────
    if (isGuest) {
      if (now > entry.sessionRefreshAt) {
        entry.sessionCount = 0;
        entry.sessionRefreshAt = now + SESSION_DURATION_MS;
      }

      // Hourly limit
      const recentHour = entry.timestamps.filter((ts) => now - ts < 3600000);
      if (recentHour.length >= GUEST_CONFIG.maxPerHour) {
        const oldestInWindow = recentHour[0];
        const retryAfter = Math.ceil(
          (oldestInWindow + 3600000 - now) / 1000,
        );
        return {
          allowed: false,
          remaining: 0,
          resetAt: oldestInWindow + 3600000,
          retryAfter,
          isGuest: true,
          messageLimit: GUEST_CONFIG.maxPerHour,
        };
      }

      // Session limit
      if (entry.sessionCount >= GUEST_CONFIG.maxPerSession) {
        const retryAfter = Math.ceil(
          (entry.sessionRefreshAt - now) / 1000,
        );
        return {
          allowed: false,
          remaining: 0,
          resetAt: entry.sessionRefreshAt,
          retryAfter: Math.max(retryAfter, 1),
          isGuest: true,
          messageLimit: GUEST_CONFIG.maxPerSession,
        };
      }

      // Cooldown
      if (recentHour.length > 0) {
        const lastTs = recentHour[recentHour.length - 1];
        const elapsed = now - lastTs;
        if (elapsed < GUEST_CONFIG.cooldownMs) {
          const retryAfter = Math.ceil(
            (GUEST_CONFIG.cooldownMs - elapsed) / 1000,
          );
          return {
            allowed: false,
            remaining: GUEST_CONFIG.maxPerHour - recentHour.length,
            resetAt: lastTs + GUEST_CONFIG.cooldownMs,
            retryAfter,
            isGuest: true,
            messageLimit: GUEST_CONFIG.maxPerSession,
          };
        }
      }

      // Allow
      entry.timestamps.push(now);
      entry.sessionCount++;
      RateLimiter._entryCache.set(key, entry);

      return {
        allowed: true,
        remaining: GUEST_CONFIG.maxPerSession - entry.sessionCount,
        resetAt: entry.sessionRefreshAt,
        isGuest: true,
        messageLimit: GUEST_CONFIG.maxPerSession,
      };
    }

    // ── Auth logic ─────────────────────────────────────
    const recentMinute = entry.timestamps.filter((ts) => now - ts < 60000);
    const recentHour = entry.timestamps.filter((ts) => now - ts < 3600000);

    if (recentMinute.length >= AUTH_CONFIG.maxPerMinute) {
      const oldestInMinute = recentMinute[0];
      const retryAfter = Math.ceil(
        (oldestInMinute + 60000 - now) / 1000,
      );
      return {
        allowed: false,
        remaining: 0,
        resetAt: oldestInMinute + 60000,
        retryAfter,
        isGuest: false,
        messageLimit: AUTH_CONFIG.maxPerMinute,
      };
    }

    if (recentHour.length >= AUTH_CONFIG.maxPerHour) {
      const oldestInHour = recentHour[0];
      const retryAfter = Math.ceil(
        (oldestInHour + 3600000 - now) / 1000,
      );
      return {
        allowed: false,
        remaining: 0,
        resetAt: oldestInHour + 3600000,
        retryAfter,
        isGuest: false,
        messageLimit: AUTH_CONFIG.maxPerHour,
      };
    }

    entry.timestamps.push(now);
    RateLimiter._entryCache.set(key, entry);

    return {
      allowed: true,
      remaining: AUTH_CONFIG.maxPerHour - recentHour.length - 1,
      resetAt: now + 60000,
      isGuest: false,
      messageLimit: AUTH_CONFIG.maxPerHour,
    };
  }

  // ── Helpers ─────────────────────────────────────────────

  static getRemainingCount(userIdOrIp: string, isGuest: boolean): number {
    const key = isGuest ? `guest:${userIdOrIp}` : `auth:${userIdOrIp}`;
    const entry = RateLimiter._entryCache.get(key);
    if (!entry)
      return isGuest ? GUEST_CONFIG.maxPerSession : AUTH_CONFIG.maxPerHour;

    const now = Date.now();
    const recentHour = entry.timestamps.filter((ts) => now - ts < 3600000);
    if (isGuest) {
      return Math.max(0, GUEST_CONFIG.maxPerHour - recentHour.length);
    }
    return Math.max(0, AUTH_CONFIG.maxPerHour - recentHour.length);
  }

  static resetLimit(userIdOrIp: string): void {
    RateLimiter._entryCache.delete(`guest:${userIdOrIp}`);
    RateLimiter._entryCache.delete(`auth:${userIdOrIp}`);
  }

  static getGuestMessageCount(ip: string): number {
    const key = `guest:${ip}`;
    const entry = RateLimiter._entryCache.get(key);
    return entry?.sessionCount ?? 0;
  }

  static incrementGuestMessageCount(ip: string): number {
    const key = `guest:${ip}`;
    const now = Date.now();
    let entry = RateLimiter._entryCache.get(key);
    if (!entry) {
      entry = {
        timestamps: [now],
        sessionCount: 1,
        sessionRefreshAt: now + SESSION_DURATION_MS,
      };
      RateLimiter._entryCache.set(key, entry);
      return 1;
    }
    entry.timestamps.push(now);
    entry.sessionCount++;
    RateLimiter._entryCache.set(key, entry);
    return entry.sessionCount;
  }

  /** Clear all in-memory state (used in tests) */
  static _clearStore(): void {
    RateLimiter._entryCache.clear();
  }
}
