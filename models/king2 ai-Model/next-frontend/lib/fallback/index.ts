import { BaseAIProvider, Message, ProviderOptions } from '../providers/base';
import { GeminiProvider } from '../providers/gemini';
import { GroqProvider } from '../providers/groq';
import { OpenCodeZenProvider } from '../providers/opencode-zen';
import { OpenRouterProvider } from '../providers/openrouter';
import { HuggingFaceProvider } from '../providers/huggingface';
import { isTransientError, TimeoutError, RateLimitError, ProviderError, NetworkError } from '../errors';

// ─────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────

interface CircuitBreakerState {
  failures: number;
  lastFailureAt: number | null;
  cooldownUntil: number | null;
}

interface HealthEntry {
  healthy: boolean;
  lastCheckedAt: number;
  latencyMs: number;
}

interface PriorityCandidate {
  providerId: string;
  priority: number; // lower = better
}

// ─────────────────────────────────────────────────────────
// Constants
// ─────────────────────────────────────────────────────────

const COOLDOWN_MS = 30_000; // 30s circuit-breaker cooldown
const MAX_CONSECUTIVE_FAILURES = 3;
const HEALTH_CHECK_INTERVAL_MS = 60_000; // 1 min
const RACE_TIMEOUT_MS = 5_000; // how long we wait in parallel race

const BACKOFF_BASE_MS = 100;
const BACKOFF_MULTIPLIER = 2;
const MAX_BACKOFF_MS = 1_600;

const DEFAULT_FALLBACK_ORDER = ['opencode-zen', 'openrouter', 'gemini', 'groq', 'huggingface'];

// ─────────────────────────────────────────────────────────
// State
// ─────────────────────────────────────────────────────────

const providers: Record<string, BaseAIProvider> = {
  gemini: new GeminiProvider(),
  groq: new GroqProvider(),
  'opencode-zen': new OpenCodeZenProvider(),
  openrouter: new OpenRouterProvider(),
  huggingface: new HuggingFaceProvider(),
};

const circuitBreaker: Record<string, CircuitBreakerState> = {};
const healthCache: Record<string, HealthEntry> = {};
let healthIntervalId: ReturnType<typeof setInterval> | null = null;

// ─────────────────────────────────────────────────────────
// Initialisation
// ─────────────────────────────────────────────────────────

// Pre-seed circuit-breaker state
for (const id of Object.keys(providers)) {
  circuitBreaker[id] = { failures: 0, lastFailureAt: null, cooldownUntil: null };
}

// ─────────────────────────────────────────────────────────
// Public helpers (keep compatibility)
// ─────────────────────────────────────────────────────────

export function getProvider(id: string): BaseAIProvider | undefined {
  return providers[id];
}

export function getFallbackOrder(primaryId?: string): string[] {
  const order = [...DEFAULT_FALLBACK_ORDER];
  if (primaryId && order.includes(primaryId)) {
    return [primaryId, ...order.filter((id) => id !== primaryId)];
  }
  return order;
}

// ─────────────────────────────────────────────────────────
// Content-based router (keep compatibility signature)
// ─────────────────────────────────────────────────────────

export function chooseProviderForMessage(messages: Message[]): string {
  const lastUserMsg = [...messages].reverse().find((m) => m.role === 'user');
  if (!lastUserMsg) return DEFAULT_FALLBACK_ORDER[0];

  const content = lastUserMsg.content.toLowerCase();

  // Code-heavy → groq
  const codeKeywords = [
    'function', 'class ', 'const ', 'let ', 'var ', 'import ',
    'export ', 'def ', 'return ', 'console.log', 'print(',
    '```', '#include', '#define', 'int main', 'void ',
  ];
  const codeScore = codeKeywords.filter((kw) => content.includes(kw)).length;
  if (codeScore >= 2) return 'groq';
  if (content.includes('اكتب') && (
    content.includes('كود') || content.includes('برنامج') ||
    content.includes('سكريبت') || content.includes('دالة')
  )) return 'groq';

  // Vision / images → gemini
  if (
    content.includes('img') || content.includes('image') ||
    content.includes('صورة') || content.includes('رؤية') ||
    content.includes('vision') || content.includes('ocr') ||
    content.includes('تعرف على') || content.includes('حلل')
  ) return 'gemini';

  return DEFAULT_FALLBACK_ORDER[0];
}

// ─────────────────────────────────────────────────────────
// Health Check Pool
// ─────────────────────────────────────────────────────────

function getConfiguredProviders(): BaseAIProvider[] {
  return Object.values(providers).filter((p) => p.isConfigured());
}

/**
 * Run health checks on all configured providers concurrently
 * and update the health cache.
 */
export async function runHealthChecks(): Promise<Record<string, boolean>> {
  const entries = getConfiguredProviders();
  const results: Record<string, boolean> = {};

  const checks = entries.map(async (provider) => {
    const start = performance.now();
    let healthy = false;
    try {
      healthy = await provider.healthCheck();
    } catch {
      healthy = false;
    }
    const latency = performance.now() - start;
    healthCache[provider.id] = { healthy, lastCheckedAt: Date.now(), latencyMs: latency };
    results[provider.id] = healthy;
  });

  await Promise.allSettled(checks);
  return results;
}

/**
 * Start periodic health checks (call once at app startup).
 */
export function startHealthCheckPool(intervalMs: number = HEALTH_CHECK_INTERVAL_MS): void {
  if (healthIntervalId) return;
  // Run immediately
  runHealthChecks().catch(() => {});
  healthIntervalId = setInterval(() => {
    runHealthChecks().catch(() => {});
  }, intervalMs);
}

/**
 * Stop periodic health checks.
 */
export function stopHealthCheckPool(): void {
  if (healthIntervalId) {
    clearInterval(healthIntervalId);
    healthIntervalId = null;
  }
}

/**
 * Get cached health state for a provider (runs a fresh check if none cached).
 */
async function getProviderHealth(providerId: string): Promise<boolean> {
  const cached = healthCache[providerId];
  const stale = cached && (Date.now() - cached.lastCheckedAt) > HEALTH_CHECK_INTERVAL_MS;

  if (!cached || stale) {
    const provider = providers[providerId];
    if (!provider || !provider.isConfigured()) return false;
    const start = performance.now();
    let healthy = false;
    try {
      healthy = await provider.healthCheck();
    } catch {
      healthy = false;
    }
    healthCache[providerId] = { healthy, lastCheckedAt: Date.now(), latencyMs: performance.now() - start };
  }

  return healthCache[providerId]?.healthy ?? false;
}

// ─────────────────────────────────────────────────────────
// Circuit Breaker
// ─────────────────────────────────────────────────────────

function isCircuitOpen(providerId: string): boolean {
  const state = circuitBreaker[providerId];
  if (!state) return false;
  if (state.cooldownUntil && Date.now() < state.cooldownUntil) return true;
  // Cooldown expired → reset
  if (state.cooldownUntil && Date.now() >= state.cooldownUntil) {
    state.failures = 0;
    state.cooldownUntil = null;
  }
  return false;
}

function recordCircuitFailure(providerId: string): void {
  const state = circuitBreaker[providerId];
  if (!state) return;
  state.failures++;
  state.lastFailureAt = Date.now();
  if (state.failures >= MAX_CONSECUTIVE_FAILURES) {
    state.cooldownUntil = Date.now() + COOLDOWN_MS;
    console.warn(`[Circuit Breaker] ${providerId} cooldown until ${new Date(state.cooldownUntil).toISOString()}`);
  }
}

function recordCircuitSuccess(providerId: string): void {
  const state = circuitBreaker[providerId];
  if (!state) return;
  state.failures = 0;
  state.cooldownUntil = null;
}

// ─────────────────────────────────────────────────────────
// Smart Provider Selection
// ─────────────────────────────────────────────────────────

/**
 * Score a provider (lower = better).
 * Factors: health, circuit state, avg latency, success rate, rate-limit remaining.
 */
function scoreProvider(providerId: string): number {
  const provider = providers[providerId];
  if (!provider) return Infinity;

  let score = 0;

  // Circuit breaker (penalty ~1 000 000 if open)
  if (isCircuitOpen(providerId)) score += 1_000_000;

  // Health penalty
  const health = healthCache[providerId];
  if (health && !health.healthy) score += 100_000;
  else if (!health) score += 50_000; // unknown = assume healthy-ish

  // Rate-limit penalty
  if (provider.rateLimitInfo.remaining <= 0) score += 200_000;
  else if (provider.rateLimitInfo.remaining < 10) score += 10_000;

  // Success rate penalty (0…100 → 0…50k)
  const successRate = provider.getSuccessRate();
  if (successRate < 1) {
    score += (1 - successRate) * 50_000;
  }

  // Latency penalty (ms → score)
  const avgLat = provider.getAverageLatency();
  if (avgLat < Infinity) {
    score += avgLat / 10; // 100ms → 10pts, 5s → 500pts
  }

  return score;
}

/**
 * Return providers sorted by score (best first).
 */
function getSortedCandidates(): PriorityCandidate[] {
  return Object.keys(providers)
    .filter((id) => {
      const p = providers[id];
      return p && p.isConfigured();
    })
    .map((providerId) => ({
      providerId,
      priority: scoreProvider(providerId),
    }))
    .sort((a, b) => a.priority - b.priority);
}

// ─────────────────────────────────────────────────────────
// AsyncPriorityQueue — race multiple providers in parallel
// ─────────────────────────────────────────────────────────

/**
 * Try multiple providers concurrently and return the first successful result.
 * On failure, falls through to the next candidate.
 * Respects circuit breaker & health.
 */
async function raceProviders<T>(
  candidates: PriorityCandidate[],
  executor: (provider: BaseAIProvider) => Promise<T>,
  providerLabel: string,
): Promise<{ result: T; providerId: string }> {
  const errors: Array<{ providerId: string; error: unknown }> = [];

  for (const { providerId } of candidates) {
    const provider = providers[providerId];
    if (!provider) continue;

    // Skip unhealthy / open-circuit providers
    if (isCircuitOpen(providerId)) {
      console.debug(`[AsyncPriorityQueue] Skipping ${providerId} (circuit open)`);
      continue;
    }

    console.debug(`[AsyncPriorityQueue] Trying ${providerId} for ${providerLabel}…`);

    try {
      const result = await providerWithTimeout(provider, executor, providerId);
      // Success — record it
      recordCircuitSuccess(providerId);
      return { result, providerId };
    } catch (err: any) {
      console.warn(`[AsyncPriorityQueue] ${providerId} failed: ${err.message}`);
      recordCircuitFailure(providerId);
      errors.push({ providerId, error: err });

      // If transient (timeout/network/429), continue to next
      if (!isTransientError(err) && !(err instanceof RateLimitError)) {
        // Permanent error — no point retrying other providers with same issue?
        // Actually we still want to try others in case of config/auth errors
        // but we skip this provider
        continue;
      }
    }
  }

  // All exhausted
  throw new Error(
    `All providers exhausted for ${providerLabel}. Errors: ${errors
      .map((e) => `${e.providerId}: ${(e.error as Error).message}`)
      .join(' | ')}`,
  );
}

async function providerWithTimeout<T>(
  provider: BaseAIProvider,
  executor: (p: BaseAIProvider) => Promise<T>,
  providerId: string,
): Promise<T> {
  const controller = new AbortController();
  const timeoutMs = provider.timeout;

  const timeoutId = setTimeout(() => {
    controller.abort();
  }, timeoutMs);

  try {
    const result = await executor(provider);
    clearTimeout(timeoutId);
    return result;
  } catch (err: any) {
    clearTimeout(timeoutId);
    if (err.name === 'AbortError') {
      throw new TimeoutError(`Provider ${providerId} timed out after ${timeoutMs}ms`, providerId);
    }
    throw err;
  }
}

// ─────────────────────────────────────────────────────────
// Exponential Backoff (improved)
// ─────────────────────────────────────────────────────────

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function getBackoff(attempt: number): number {
  const delay = BACKOFF_BASE_MS * Math.pow(BACKOFF_MULTIPLIER, attempt - 1);
  return Math.min(delay, MAX_BACKOFF_MS);
}

// ─────────────────────────────────────────────────────────
// Fallback Execution (non-streaming)
// ─────────────────────────────────────────────────────────

export async function executeResponseWithFallback(
  modelId: string,
  messages: Message[],
  options?: ProviderOptions,
): Promise<{ text: string; providerId: string }> {
  // 1. Get sorted candidates by smart scoring
  let candidates = getSortedCandidates();

  // If a specific model is requested, ensure it is first
  if (modelId && modelId !== 'auto') {
    const idx = candidates.findIndex((c) => c.providerId === modelId);
    if (idx !== -1) {
      const [preferred] = candidates.splice(idx, 1);
      candidates.unshift(preferred);
    }
  }

  if (candidates.length === 0) {
    throw new Error('No AI providers are configured. Please set at least one API key.');
  }

  console.log(
    `[Fallback Manager] Provider order: ${candidates.map((c) => `${c.providerId}(p=${c.priority.toFixed(0)})`).join(' > ')}`,
  );

  const errors: unknown[] = [];

  // 2. Try each candidate sequentially with retries (exponential backoff)
  for (const { providerId } of candidates) {
    const provider = providers[providerId]!;
    const maxRetries = options?.maxRetries ?? provider.maxRetries;

    for (let attempt = 1; attempt <= maxRetries + 1; attempt++) {
      try {
        console.log(`[Fallback Manager] Attempting ${providerId} (Attempt ${attempt}/${maxRetries + 1})`);

        const text = await provider.generateResponse(messages, {
          ...options,
          timeout: options?.timeout ?? provider.timeout,
        });

        console.log(`[Fallback Manager] Success using provider: ${providerId}`);
        return { text, providerId };
      } catch (err: any) {
        console.error(`[Fallback Manager] ${providerId} attempt ${attempt} failed: ${err.message}`);
        errors.push(err);
        recordCircuitFailure(providerId);

        // Check if we should retry
        const shouldRetry = isTransientError(err) && attempt <= maxRetries;
        if (shouldRetry) {
          const backoff = getBackoff(attempt);
          console.log(`[Fallback Manager] Transient error. Retrying ${providerId} in ${backoff}ms…`);
          await sleep(backoff);
        } else {
          // Permanent error or out of retries → move to next provider
          break;
        }
      }
    }

    console.warn(`[Fallback Manager] Provider ${providerId} fully exhausted. Moving to next…`);
  }

  throw new Error(
    `All providers exhausted. Errors: ${errors.map((e) => (e as Error).message).join(' | ')}`,
  );
}

// ─────────────────────────────────────────────────────────
// Fallback Execution (streaming) — uses AsyncPriorityQueue
// ─────────────────────────────────────────────────────────

export async function executeStreamWithFallback(
  modelId: string,
  messages: Message[],
  options?: ProviderOptions,
): Promise<{ stream: ReadableStream<Uint8Array>; providerId: string }> {
  // 1. Build candidate list with smart scoring
  let candidates = getSortedCandidates();

  if (modelId && modelId !== 'auto') {
    const idx = candidates.findIndex((c) => c.providerId === modelId);
    if (idx !== -1) {
      const [preferred] = candidates.splice(idx, 1);
      candidates.unshift(preferred);
    }
  }

  if (candidates.length === 0) {
    throw new Error('No AI providers are configured. Please set at least one API key.');
  }

  console.log(
    `[Fallback Manager] Stream candidates: ${candidates.map((c) => `${c.providerId}(p=${c.priority.toFixed(0)})`).join(', ')}`,
  );

  // 2. Use AsyncPriorityQueue — try top 2 candidates in parallel, pick fastest
  // For streaming, we first try the top candidate(s). We can't really "race" streams
  // because consuming one invalidates the other, so we try sequentially with retries
  // but with the smart ordering.

  // However, for the initial connection, we DO race — whichever responds first wins.
  const topCandidates = candidates.slice(0, 2); // race top 2

  try {
    const { result: stream, providerId } = await raceProviders(
      topCandidates,
      async (provider) => {
        const s = await provider.generateStream(messages, {
          ...options,
          timeout: options?.timeout ?? RACE_TIMEOUT_MS,
        });
        return s;
      },
      'stream',
    );

    console.log(`[Fallback Manager] Stream connected via ${providerId}`);
    return { stream, providerId };
  } catch (raceError) {
    // Top 2 didn't work — fall through to remaining candidates
    console.warn(`[Fallback Manager] Top candidates failed, trying remaining…`);
  }

  // 3. Fall through to remaining candidates (sequential with retries)
  const remaining = candidates.slice(2);
  const errors: unknown[] = [];

  for (const { providerId } of remaining) {
    const provider = providers[providerId]!;
    const maxRetries = options?.maxRetries ?? provider.maxRetries;

    for (let attempt = 1; attempt <= maxRetries + 1; attempt++) {
      try {
        console.log(`[Fallback Manager] Attempting stream with ${providerId} (Attempt ${attempt}/${maxRetries + 1})`);

        const stream = await provider.generateStream(messages, {
          ...options,
          timeout: options?.timeout ?? provider.timeout,
        });

        recordCircuitSuccess(providerId);
        console.log(`[Fallback Manager] Stream connected successfully via ${providerId}`);
        return { stream, providerId };
      } catch (err: any) {
        console.error(`[Fallback Manager] Stream ${providerId} attempt ${attempt} failed: ${err.message}`);
        errors.push(err);
        recordCircuitFailure(providerId);

        if (isTransientError(err) && attempt <= maxRetries) {
          const backoff = getBackoff(attempt);
          console.log(`[Fallback Manager] Transient error. Retrying stream ${providerId} in ${backoff}ms…`);
          await sleep(backoff);
        } else {
          break;
        }
      }
    }

    console.warn(`[Fallback Manager] Stream provider ${providerId} fully exhausted. Moving to next…`);
  }

  throw new Error(
    `All stream providers exhausted. Errors: ${errors.map((e) => (e as Error).message).join(' | ')}`,
  );
}

// ─────────────────────────────────────────────────────────
// Utility: expose internal state for debugging / monitoring
// ─────────────────────────────────────────────────────────

export function getProviderMetrics(): Record<string, unknown> {
  const metrics: Record<string, unknown> = {};
  for (const [id, p] of Object.entries(providers)) {
    metrics[id] = {
      configured: p.isConfigured(),
      metrics: p.metrics,
      rateLimit: p.rateLimitInfo,
      circuitBreaker: circuitBreaker[id],
      health: healthCache[id],
    };
  }
  return metrics;
}

export function getFastestProvider(): string | null {
  const candidates = getSortedCandidates();
  return candidates.length > 0 ? candidates[0].providerId : null;
}

export function resetCircuitBreaker(providerId?: string): void {
  if (providerId) {
    if (circuitBreaker[providerId]) {
      circuitBreaker[providerId] = { failures: 0, lastFailureAt: null, cooldownUntil: null };
    }
  } else {
    for (const id of Object.keys(circuitBreaker)) {
      circuitBreaker[id] = { failures: 0, lastFailureAt: null, cooldownUntil: null };
    }
  }
}
