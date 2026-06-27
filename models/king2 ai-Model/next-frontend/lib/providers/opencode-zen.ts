import { BaseAIProvider, Message, ProviderOptions, RateLimitInfo } from './base';
import { ConfigurationError, ProviderError, NetworkError, RateLimitError } from '../errors';

// OpenCode Zen — OpenAI-compatible gateway (Claude, GPT, Gemini, DeepSeek…).
const OPENCODE_ZEN_MODELS = [
  'claude-sonnet-4-6',
  'claude-opus-4-8',
  'claude-haiku-4-5',
  'gemini-3.5-flash',
  'gpt-5.5',
];
const DEFAULT_MODEL = process.env.OPENCODE_ZEN_MODEL || 'claude-sonnet-4-6';
const BASE_URL = 'https://opencode.ai/zen/v1';
const TIMEOUT_MS = 30_000;
const MAX_RETRIES = 2;

export class OpenCodeZenProvider extends BaseAIProvider {
  readonly id = 'opencode-zen';
  readonly displayName = `OpenCode Zen ${DEFAULT_MODEL}`;
  readonly timeout = TIMEOUT_MS;
  readonly maxRetries = MAX_RETRIES;

  // ── Config ────────────────────────────────────────────

  isConfigured(): boolean {
    const key = process.env.OPENCODE_ZEN_API_KEY;
    return !!key && key !== 'your_api_key_here';
  }

  private getApiKey(): string {
    const key = process.env.OPENCODE_ZEN_API_KEY;
    if (!key || key === 'your_api_key_here') {
      throw new ConfigurationError('OPENCODE_ZEN_API_KEY is not configured', this.id);
    }
    return key;
  }

  // ── Models ────────────────────────────────────────────

  getModels(): string[] {
    return [...OPENCODE_ZEN_MODELS];
  }

  getRateLimits(): RateLimitInfo {
    return { ...this.rateLimitInfo };
  }

  // ── Health ────────────────────────────────────────────

  async healthCheck(): Promise<boolean> {
    if (!this.isConfigured()) return false;
    try {
      const apiKey = this.getApiKey();
      const response = await fetch(`${BASE_URL}/models`, {
        headers: { Authorization: `Bearer ${apiKey}` },
        signal: AbortSignal.timeout(5000),
      });
      return response.ok;
    } catch {
      return false;
    }
  }

  // ── Payload builder ──────────────────────────────────

  private buildPayload(messages: Message[], options?: ProviderOptions, stream = false) {
    return {
      model: DEFAULT_MODEL,
      messages,
      temperature: options?.temperature ?? 0.7,
      max_tokens: options?.maxTokens ?? 4096,
      stream,
    };
  }

  // ── Response (non-streaming) ─────────────────────────

  async generateResponse(
    messages: Message[],
    options?: ProviderOptions,
  ): Promise<string> {
    const apiKey = this.getApiKey();
    const payload = this.buildPayload(messages, options, false);
    const url = `${BASE_URL}/chat/completions`;
    const timeout = options?.timeout ?? this.timeout;

    const start = performance.now();
    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify(payload),
        signal: options?.abortSignal ?? AbortSignal.timeout(timeout),
      });

      this.updateRateLimits(response);

      if (!response.ok) {
        const errBody = await this.tryParseError(response);
        if (response.status === 429) {
          const retryAfter = this.parseRetryAfter(response);
          throw new RateLimitError(
            `OpenCode Zen rate-limited: ${errBody}`,
            this.id,
            undefined,
            retryAfter,
          );
        }
        throw new ProviderError(`OpenCode Zen API error: ${errBody}`, this.id, response.status);
      }

      const data = await response.json();
      const text = data.choices?.[0]?.message?.content;
      if (!text) {
        throw new ProviderError('OpenCode Zen API returned an empty response', this.id);
      }

      this.recordSuccess(performance.now() - start);
      return text;
    } catch (error: any) {
      this.recordFailure();
      if (error instanceof ProviderError || error instanceof ConfigurationError || error instanceof RateLimitError) throw error;
      if (error.name === 'TimeoutError' || error.name === 'AbortError') {
        throw new NetworkError(`OpenCode Zen request timed out after ${timeout}ms`, this.id, error);
      }
      throw new NetworkError(`OpenCode Zen network error: ${error.message}`, this.id, error);
    }
  }

  // ── Streaming ────────────────────────────────────────

  async generateStream(
    messages: Message[],
    options?: ProviderOptions,
  ): Promise<ReadableStream<Uint8Array>> {
    const apiKey = this.getApiKey();
    const payload = this.buildPayload(messages, options, true);
    const url = `${BASE_URL}/chat/completions`;
    const timeout = options?.timeout ?? this.timeout;

    const start = performance.now();
    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify(payload),
        signal: options?.abortSignal ?? AbortSignal.timeout(timeout),
      });

      this.updateRateLimits(response);

      if (!response.ok) {
        const errBody = await this.tryParseError(response);
        if (response.status === 429) {
          const retryAfter = this.parseRetryAfter(response);
          throw new RateLimitError(
            `OpenCode Zen stream rate-limited: ${errBody}`,
            this.id,
            undefined,
            retryAfter,
          );
        }
        throw new ProviderError(`OpenCode Zen stream error: ${errBody}`, this.id, response.status);
      }

      if (!response.body) {
        throw new ProviderError('OpenCode Zen stream response body is null', this.id);
      }

      this.recordSuccess(performance.now() - start);
      return this.parseOpenAIStreamToText(response.body);
    } catch (error: any) {
      this.recordFailure();
      if (error instanceof ProviderError || error instanceof ConfigurationError || error instanceof RateLimitError) throw error;
      if (error.name === 'TimeoutError' || error.name === 'AbortError') {
        throw new NetworkError(`OpenCode Zen stream timed out after ${timeout}ms`, this.id, error);
      }
      throw new NetworkError(`OpenCode Zen streaming network error: ${error.message}`, this.id, error);
    }
  }

  // ── SSE → text/plain stream (OpenAI-compatible) ──────

  private parseOpenAIStreamToText(
    responseBody: ReadableStream<Uint8Array>,
  ): ReadableStream<Uint8Array> {
    const decoder = new TextDecoder();
    const encoder = new TextEncoder();
    const reader = responseBody.getReader();
    let buffer = '';

    return new ReadableStream({
      async start(controller) {
        try {
          while (true) {
            const { done, value } = await reader.read();
            if (done) {
              controller.close();
              break;
            }
            buffer += decoder.decode(value, { stream: true });
            const lines = buffer.split('\n');
            buffer = lines.pop() || '';

            for (const line of lines) {
              const trimmed = line.trim();
              if (!trimmed || !trimmed.startsWith('data:')) continue;
              const dataStr = trimmed.slice(5).trim();
              if (!dataStr || dataStr === '[DONE]') continue;

              try {
                const parsed = JSON.parse(dataStr);
                const text = parsed.choices?.[0]?.delta?.content;
                if (text) {
                  controller.enqueue(encoder.encode(text));
                }
              } catch {
                // skip malformed chunks
              }
            }
          }
        } catch (err) {
          controller.error(err);
        }
      },
      cancel() { reader.cancel(); },
    });
  }

  // ── Helpers ───────────────────────────────────────────

  private updateRateLimits(response: Response): void {
    const remaining = response.headers.get('X-RateLimit-Remaining');
    const reset = response.headers.get('X-RateLimit-Reset');
    if (remaining) this.rateLimitInfo.remaining = parseInt(remaining, 10);
    if (reset) this.rateLimitInfo.resetAt = parseInt(reset, 10) * 1000;
  }

  private parseRetryAfter(response: Response): number | undefined {
    const val = response.headers.get('Retry-After');
    if (!val) return undefined;
    const secs = parseInt(val, 10);
    return isNaN(secs) ? undefined : secs * 1000;
  }

  private async tryParseError(response: Response): Promise<string> {
    try {
      const errData = await response.clone().json();
      return errData.error?.message || response.statusText;
    } catch {
      return response.statusText;
    }
  }
}
