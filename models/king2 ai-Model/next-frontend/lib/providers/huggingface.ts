import { BaseAIProvider, Message, ProviderOptions, RateLimitInfo } from './base';
import { ConfigurationError, ProviderError, NetworkError } from '../errors';

const HF_MODELS = [
  'meta-llama/Meta-Llama-3.1-8B-Instruct',
  'microsoft/Phi-3.5-mini-instruct',
  'google/gemma-2-2b-it',
  'mistralai/Mistral-7B-Instruct-v0.3',
  'Qwen/Qwen2.5-7B-Instruct',
];
const DEFAULT_MODEL = 'meta-llama/Meta-Llama-3.1-8B-Instruct';
const BASE_URL = 'https://api-inference.huggingface.co/v1';
const TIMEOUT_MS = 25_000;

export class HuggingFaceProvider extends BaseAIProvider {
  readonly id = 'huggingface';
  readonly displayName = 'HuggingFace Inference';
  readonly timeout = TIMEOUT_MS;
  readonly maxRetries = 1;

  isConfigured(): boolean {
    const key = process.env.HF_TOKEN;
    return !!key && key !== 'your_hf_token_here';
  }

  private getApiKey(): string {
    const key = process.env.HF_TOKEN;
    if (!key || key === 'your_hf_token_here') {
      throw new ConfigurationError('HF_TOKEN is not configured', this.id);
    }
    return key;
  }

  getModels(): string[] {
    return [...HF_MODELS];
  }

  getRateLimits(): RateLimitInfo {
    return { ...this.rateLimitInfo };
  }

  async healthCheck(): Promise<boolean> {
    if (!this.isConfigured()) return false;
    try {
      const apiKey = this.getApiKey();
      const url = `${BASE_URL}/models`;
      const response = await fetch(url, {
        headers: { Authorization: `Bearer ${apiKey}` },
        signal: AbortSignal.timeout(5000),
      });
      return response.ok;
    } catch {
      return false;
    }
  }

  private buildPayload(messages: Message[], options?: ProviderOptions, stream = false) {
    return {
      model: DEFAULT_MODEL,
      messages,
      temperature: options?.temperature ?? 0.7,
      max_tokens: options?.maxTokens ?? 4096,
      stream,
    };
  }

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

      if (!response.ok) {
        const errBody = await this.tryParseError(response);
        throw new ProviderError(`HF Inference API error: ${errBody}`, this.id, response.status);
      }

      const data = await response.json();
      const text = data.choices?.[0]?.message?.content;
      if (!text) {
        throw new ProviderError('HF Inference returned an empty response', this.id);
      }

      this.recordSuccess(performance.now() - start);
      return text;
    } catch (error: any) {
      this.recordFailure();
      if (error instanceof ProviderError || error instanceof ConfigurationError) throw error;
      if (error.name === 'TimeoutError' || error.name === 'AbortError') {
        throw new NetworkError(`HF Inference timed out after ${timeout}ms`, this.id, error);
      }
      throw new NetworkError(`HF Inference network error: ${error.message}`, this.id, error);
    }
  }

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

      if (!response.ok) {
        const errBody = await this.tryParseError(response);
        throw new ProviderError(`HF Inference stream error: ${errBody}`, this.id, response.status);
      }

      if (!response.body) {
        throw new ProviderError('HF Inference stream response body is null', this.id);
      }

      this.recordSuccess(performance.now() - start);
      return this.parseOpenAIStreamToText(response.body);
    } catch (error: any) {
      this.recordFailure();
      if (error instanceof ProviderError || error instanceof ConfigurationError) throw error;
      if (error.name === 'TimeoutError' || error.name === 'AbortError') {
        throw new NetworkError(`HF Inference stream timed out after ${timeout}ms`, this.id, error);
      }
      throw new NetworkError(`HF Inference streaming network error: ${error.message}`, this.id, error);
    }
  }

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
            if (done) { controller.close(); break; }
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
                if (text) controller.enqueue(encoder.encode(text));
              } catch { /* skip */ }
            }
          }
        } catch (err) { controller.error(err); }
      },
      cancel() { reader.cancel(); },
    });
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
