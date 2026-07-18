import { BaseAIProvider, Message, ProviderOptions, RateLimitInfo } from './base';
import { ConfigurationError, ProviderError, NetworkError, RateLimitError } from '../errors';

const GEMINI_MODELS = ['gemini-2.5-flash', 'gemini-2.5-pro', 'gemini-2.0-flash'];
const DEFAULT_MODEL = 'gemini-2.5-flash';
const BASE_URL = 'https://generativelanguage.googleapis.com/v1beta';
const TIMEOUT_MS = 15_000;
const MAX_RETRIES = 2;

export class GeminiProvider extends BaseAIProvider {
  readonly id = 'gemini';
  readonly displayName = 'Gemini 2.5 Flash';
  readonly timeout = TIMEOUT_MS;
  readonly maxRetries = MAX_RETRIES;

  // ── Config ────────────────────────────────────────────

  isConfigured(): boolean {
    const key = process.env.GEMINI_API_KEY
      || process.env.GOOGLE_GENERATIVE_AI_API_KEY
      || process.env.GOOGLE_AI_API_KEY;
    return !!key && key !== 'your_api_key_here';
  }

  private getApiKey(): string {
    const key = process.env.GEMINI_API_KEY
      || process.env.GOOGLE_GENERATIVE_AI_API_KEY
      || process.env.GOOGLE_AI_API_KEY;
    if (!key || key === 'your_api_key_here') {
      throw new ConfigurationError('GEMINI_API_KEY is not configured', this.id);
    }
    return key;
  }

  // ── Models ────────────────────────────────────────────

  getModels(): string[] {
    return [...GEMINI_MODELS];
  }

  getRateLimits(): RateLimitInfo {
    return { ...this.rateLimitInfo };
  }

  // ── Health ────────────────────────────────────────────

  async healthCheck(): Promise<boolean> {
    if (!this.isConfigured()) return false;
    try {
      const apiKey = this.getApiKey();
      const url = `${BASE_URL}/models?key=${apiKey}&pageSize=1`;
      const response = await fetch(url, { signal: AbortSignal.timeout(5000) });
      return response.ok;
    } catch {
      return false;
    }
  }

  // ── Payload builder ──────────────────────────────────

  private buildPayload(messages: Message[], options?: ProviderOptions) {
    const systemMessage = messages.find((m) => m.role === 'system');
    const chatMessages = messages.filter((m) => m.role !== 'system');

    const contents = chatMessages.map((m) => ({
      role: m.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: m.content }],
    }));

    const payload: Record<string, unknown> = {
      contents,
      generationConfig: {
        temperature: options?.temperature ?? 0.7,
        maxOutputTokens: options?.maxTokens ?? 4096,
      },
    };

    if (systemMessage) {
      payload.systemInstruction = {
        parts: [{ text: systemMessage.content }],
      };
    }

    return payload;
  }

  // ── Response (non-streaming) ─────────────────────────

  async generateResponse(
    messages: Message[],
    options?: ProviderOptions,
  ): Promise<string> {
    const apiKey = this.getApiKey();
    const payload = this.buildPayload(messages, options);
    const model = options?.maxTokens && options.maxTokens < 1000 ? 'gemini-2.0-flash' : DEFAULT_MODEL;
    const url = `${BASE_URL}/models/${model}:generateContent?key=${apiKey}`;
    const timeout = options?.timeout ?? this.timeout;

    const start = performance.now();
    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
        signal: options?.abortSignal ?? AbortSignal.timeout(timeout),
      });

      this.updateRateLimits(response);

      if (!response.ok) {
        const errBody = await this.tryParseError(response);
        if (response.status === 429) {
          const retryAfter = this.parseRetryAfter(response);
          throw new RateLimitError(
            `Gemini rate-limited: ${errBody}`,
            this.id,
            undefined,
            retryAfter,
          );
        }
        throw new ProviderError(`Gemini API error: ${errBody}`, this.id, response.status);
      }

      const data = await response.json();
      const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
      if (!text) {
        throw new ProviderError('Gemini API returned an empty response', this.id);
      }

      this.recordSuccess(performance.now() - start);
      return text;
    } catch (error: any) {
      this.recordFailure();
      if (error instanceof ProviderError || error instanceof ConfigurationError || error instanceof RateLimitError) throw error;
      if (error.name === 'TimeoutError' || error.name === 'AbortError') {
        throw new NetworkError(`Gemini request timed out after ${timeout}ms`, this.id, error);
      }
      throw new NetworkError(`Gemini network error: ${error.message}`, this.id, error);
    }
  }

  // ── Streaming ────────────────────────────────────────

  async generateStream(
    messages: Message[],
    options?: ProviderOptions,
  ): Promise<ReadableStream<Uint8Array>> {
    const apiKey = this.getApiKey();
    const payload = this.buildPayload(messages, options);
    const model = DEFAULT_MODEL;
    const url = `${BASE_URL}/models/${model}:streamGenerateContent?key=${apiKey}&alt=sse`;
    const timeout = options?.timeout ?? this.timeout;

    const start = performance.now();
    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
        signal: options?.abortSignal ?? AbortSignal.timeout(timeout),
      });

      this.updateRateLimits(response);

      if (!response.ok) {
        const errBody = await this.tryParseError(response);
        if (response.status === 429) {
          const retryAfter = this.parseRetryAfter(response);
          throw new RateLimitError(
            `Gemini stream rate-limited: ${errBody}`,
            this.id,
            undefined,
            retryAfter,
          );
        }
        throw new ProviderError(`Gemini stream error: ${errBody}`, this.id, response.status);
      }

      if (!response.body) {
        throw new ProviderError('Gemini stream response body is null', this.id);
      }

      this.recordSuccess(performance.now() - start);
      return this.parseGeminiStreamToText(response.body);
    } catch (error: any) {
      this.recordFailure();
      if (error instanceof ProviderError || error instanceof ConfigurationError || error instanceof RateLimitError) throw error;
      if (error.name === 'TimeoutError' || error.name === 'AbortError') {
        throw new NetworkError(`Gemini stream timed out after ${timeout}ms`, this.id, error);
      }
      throw new NetworkError(`Gemini streaming network error: ${error.message}`, this.id, error);
    }
  }

  // ── SSE → text/plain stream ──────────────────────────

  private parseGeminiStreamToSource(
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
                const text = parsed.candidates?.[0]?.content?.parts?.[0]?.text;
                if (text) {
                  controller.enqueue(encoder.encode(text));
                }
              } catch {
                // skip malformed JSON lines
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

  /** Wraps parseGeminiStreamToSource for clarity */
  private parseGeminiStreamToText = this.parseGeminiStreamToSource;

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
