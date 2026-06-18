export interface Message {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export interface ProviderOptions {
  temperature?: number;
  maxTokens?: number;
  abortSignal?: AbortSignal;
  timeout?: number; // per-request timeout in ms
  maxRetries?: number;
}

export interface RateLimitInfo {
  remaining: number;
  resetAt: number | null; // timestamp
  total: number;
  retryAfterMs: number | null;
}

export interface ProviderMetrics {
  successCount: number;
  failCount: number;
  totalLatencyMs: number;
  lastLatencyMs: number;
  lastSuccessAt: number | null;
  lastFailureAt: number | null;
  consecutiveFailures: number;
}

export abstract class BaseAIProvider {
  abstract readonly id: string;
  abstract readonly displayName: string;

  /** Provider-level configurable timeouts and retries */
  readonly maxRetries: number = 2;
  readonly timeout: number = 15000; // 15s default

  /** Current known rate-limit state */
  rateLimitInfo: RateLimitInfo = {
    remaining: Infinity,
    resetAt: null,
    total: Infinity,
    retryAfterMs: null,
  };

  /** In-memory performance metrics */
  metrics: ProviderMetrics = {
    successCount: 0,
    failCount: 0,
    totalLatencyMs: 0,
    lastLatencyMs: 0,
    lastSuccessAt: null,
    lastFailureAt: null,
    consecutiveFailures: 0,
  };

  // ── Abstract ──────────────────────────────────────────

  abstract isConfigured(): boolean;

  abstract generateResponse(
    messages: Message[],
    options?: ProviderOptions,
  ): Promise<string>;

  abstract generateStream(
    messages: Message[],
    options?: ProviderOptions,
  ): Promise<ReadableStream<Uint8Array>>;

  // ── Health ────────────────────────────────────────────

  /**
   * Send a lightweight request to verify the provider is reachable
   * and the API key is valid. Default implementation does a minimal
   * chat-completion call. Override per provider for cheaper checks.
   */
  async healthCheck(): Promise<boolean> {
    if (!this.isConfigured()) return false;
    try {
      const start = performance.now();
      await this.generateResponse(
        [{ role: 'user', content: 'ping' }],
        { maxTokens: 1, timeout: 5000 },
      );
      const latency = performance.now() - start;
      this.metrics.lastLatencyMs = latency;
      return true;
    } catch {
      return false;
    }
  }

  /** Return the list of model names this provider supports. */
  abstract getModels(): string[];

  /** Return rate-limit headers parsed into a structured object. */
  abstract getRateLimits(): RateLimitInfo;

  // ── Metrics helpers ───────────────────────────────────

  recordSuccess(latencyMs: number): void {
    this.metrics.successCount++;
    this.metrics.totalLatencyMs += latencyMs;
    this.metrics.lastLatencyMs = latencyMs;
    this.metrics.lastSuccessAt = Date.now();
    this.metrics.consecutiveFailures = 0;
  }

  recordFailure(): void {
    this.metrics.failCount++;
    this.metrics.lastFailureAt = Date.now();
    this.metrics.consecutiveFailures++;
  }

  getAverageLatency(): number {
    const total = this.metrics.successCount + this.metrics.failCount;
    if (total === 0) return Infinity;
    return this.metrics.successCount > 0
      ? this.metrics.totalLatencyMs / this.metrics.successCount
      : Infinity;
  }

  getSuccessRate(): number {
    const total = this.metrics.successCount + this.metrics.failCount;
    if (total === 0) return 0;
    return this.metrics.successCount / total;
  }
}
