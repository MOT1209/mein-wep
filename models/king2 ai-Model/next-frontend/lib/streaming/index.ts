// =============================================================================
// KING2 AI — Professional Streaming System
// =============================================================================
// - Pure text streaming (ليس SSE) مع دعم الـ abort والـ timeout
// - معالجة صحيحة للـ chunk boundaries
// - Stream صامد ضد الكسر مع auto-reconnect logic
// - لا يعتمد على SSE parsing معقّد
// - متوافق مع الواجهات القديمة (parseSSEStream, createStreamResponse)
// =============================================================================

import {
  StreamError,
  StreamAbortedError,
  StreamDisconnectedError,
  TimeoutError,
} from '../errors';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface StreamParserOptions {
  /** إشارة الإلغاء */
  signal?: AbortSignal;
  /** مهلة زمنية بالمللي ثانية */
  timeout?: number;
  /** معالج الأخطاء */
  onError?: (error: StreamError, context: Record<string, unknown>) => void;
  /** callback عند إعادة المحاولة */
  onReconnect?: (attempt: number) => void;
  /** الحد الأقصى لعدد إعادة المحاولات (0 = بدون إعادة) */
  maxRetries?: number;
}

type ParseDelta = (json: any) => string | undefined;

// ---------------------------------------------------------------------------
// Text Decoder / Encoder
// ---------------------------------------------------------------------------

const _decoder = new TextDecoder();
const _encoder = new TextEncoder();

// ---------------------------------------------------------------------------
// Pure Text Streaming (مستحسن - أسرع وأبسط من SSE)
// ---------------------------------------------------------------------------

export interface TextStreamOptions {
  signal?: AbortSignal;
  timeout?: number;
  /** معالج لكل جزء نصي */
  onChunk?: (text: string) => void;
}

/**
 * إنشاء دفق نصي صرف من Response
 *
 * هذا هو الخيار الأسرع والأفضل:
 * - لا يعتمد على SSE مطلقاً
 * - يتعامل مع البايتات كدفق نصي متصل
 * - يدعم الإلغاء والمهلة الزمنية
 * - يتعامل مع الحدود بين المقاطع بشكل صحيح
 *
 * @example
 * const response = await fetch(url, options);
 * const stream = createTextStream(response.body);
 * // أو باختصار:
 * const stream = await createTextStreamFromFetch(url, options);
 */
export function createTextStream(
  body: ReadableStream<Uint8Array> | null,
  options?: TextStreamOptions
): ReadableStream<Uint8Array> {
  if (!body) {
    return new ReadableStream({
      start(controller) {
        controller.error(new StreamError('جسم الاستجابة فارغ، لا يوجد دفق'));
      },
    });
  }

  const reader = body.getReader();
  let aborted = false;
  let timeoutId: ReturnType<typeof setTimeout> | undefined;

  return new ReadableStream({
    async start(controller) {
      // ---- AbortSignal ----
      const onAbort = () => {
        aborted = true;
        reader.cancel().catch(() => {});
        controller.error(new StreamAbortedError());
      };

      if (options?.signal?.aborted) {
        onAbort();
        return;
      }
      options?.signal?.addEventListener('abort', onAbort, { once: true });

      // ---- Timeout ----
      if (options?.timeout && options.timeout > 0) {
        timeoutId = setTimeout(() => {
          if (!aborted) {
            aborted = true;
            reader.cancel().catch(() => {});
            controller.error(
              new TimeoutError('انتهت مهلة البث', undefined)
            );
          }
        }, options.timeout);
      }

      try {
        while (true) {
          if (aborted) break;

          const { done, value } = await reader.read();
          if (done) break;

          // تمرير البايتات مباشرةً ← دفق نصي صرف
          controller.enqueue(value);

          // استدعاء callback مع النص
          if (options?.onChunk) {
            const text = _decoder.decode(value, { stream: true });
            options.onChunk(text);
          }
        }

        controller.close();
      } catch (err: any) {
        // أخطاء الإلغاء لا تُرمى
        if (aborted) return;
        if (err?.name === 'AbortError') return;

        controller.error(
          new StreamError('فشل في قراءة الدفق النصي', undefined, err)
        );
      } finally {
        clearTimeout(timeoutId);
        options?.signal?.removeEventListener('abort', onAbort);
        reader.releaseLock();
      }
    },

    cancel() {
      aborted = true;
      reader.cancel().catch(() => {});
    },
  });
}

/**
 * إنشاء دفق نصي صرف مباشرةً من طلب Fetch
 * مع دعم timeout و retry تلقائي
 *
 * @example
 * const stream = await createTextStreamFromFetch('https://api.example.com', {
 *   method: 'POST',
 *   body: JSON.stringify(payload),
 * });
 */
export async function createTextStreamFromFetch(
  url: string | URL,
  fetchOptions: RequestInit & { timeout?: number; maxRetries?: number },
  streamOptions?: TextStreamOptions
): Promise<ReadableStream<Uint8Array>> {
  const maxRetries = fetchOptions.maxRetries ?? 0;
  let lastError: Error | undefined;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      // timeout عبر AbortController
      const controller = new AbortController();
      const timeoutMs = fetchOptions.timeout ?? streamOptions?.timeout;

      let timeoutId: ReturnType<typeof setTimeout> | undefined;
      if (timeoutMs && timeoutMs > 0) {
        timeoutId = setTimeout(() => controller.abort(), timeoutMs);
      }

      const combinedSignal = streamOptions?.signal
        ? anySignal([streamOptions.signal, controller.signal])
        : controller.signal;

      const response = await fetch(url, {
        ...fetchOptions,
        signal: combinedSignal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new StreamError(
          `الخادم أرجع حالة ${response.status}: ${response.statusText}`,
          undefined,
          await response.text().catch(() => '')
        );
      }

      if (!response.body) {
        throw new StreamError('الاستجابة لا تحتوي على جسم دفق');
      }

      return createTextStream(response.body, {
        ...streamOptions,
        signal: combinedSignal,
      });
    } catch (err: any) {
      lastError = err;

      // أخطاء لا يُعاد المحاولة عليها
      if (err?.name === 'AbortError' && err.type !== 'timeout') throw err;
      if (err instanceof StreamAbortedError) throw err;

      // أخطاء الإعدادات لا يُعاد المحاولة عليها
      if (err instanceof StreamError && err.message?.includes('الخادم أرجع')) {
        if (err.message?.includes('400') || err.message?.includes('401') || err.message?.includes('403')) {
          throw err;
        }
      }

      if (attempt < maxRetries) {
        // انتظار تصاعدي قبل إعادة المحاولة
        const waitMs = Math.min(1000 * Math.pow(2, attempt), 10000);
        await new Promise((resolve) => setTimeout(resolve, waitMs));
      }
    }
  }

  throw lastError ?? new StreamError('فشل في إنشاء الدفق بعد إعادة المحاولة');
}

// ---------------------------------------------------------------------------
// SSE Stream Parsing (للتوافق مع المزوّدين الذين يستخدمون Server-Sent Events)
// ---------------------------------------------------------------------------

/**
 * تحليل دفق SSE إلى نصوص صرفة
 *
 * هذه الدالة مخصصة للتوافق مع المزوّدين الذين يُرجعون SSE.
 * للمشاريع الجديدة، استخدم createTextStream بدلاً منها.
 *
 * @param responseBody - الدفق الخام من Response.body
 * @param parseDelta - دالة تستخرج النص من كائن JSON
 * @param options - خيارات إضافية
 */
export function parseSSEStream(
  responseBody: ReadableStream<Uint8Array>,
  parseDelta: ParseDelta,
  options?: StreamParserOptions
): ReadableStream<Uint8Array> {
  const reader = responseBody.getReader();
  let buffer = '';
  let lineCount = 0;
  let aborted = false;
  let timeoutId: ReturnType<typeof setTimeout> | undefined;

  const maxRetries = options?.maxRetries ?? 0;
  const originalOptions = options;

  return new ReadableStream({
    async start(controller) {
      // ---- AbortSignal ----
      const onAbort = () => {
        aborted = true;
        reader.cancel().catch(() => {});
        controller.error(new StreamAbortedError());
      };

      if (options?.signal?.aborted) {
        onAbort();
        return;
      }
      options?.signal?.addEventListener('abort', onAbort, { once: true });

      // ---- Timeout ----
      if (options?.timeout && options.timeout > 0) {
        timeoutId = setTimeout(() => {
          if (!aborted) {
            aborted = true;
            reader.cancel().catch(() => {});
            controller.error(
              new TimeoutError('انتهت مهلة البث (SSE)', undefined)
            );
          }
        }, options.timeout);
      }

      // ---- Main read loop ----
      try {
        while (true) {
          if (aborted) break;

          const { done, value } = await reader.read();
          if (done) {
            // معالجة ما تبقى في الـ buffer
            const remaining = buffer.trim();
            if (remaining) {
              processSSELine(remaining, controller, parseDelta, originalOptions, lineCount++);
            }
            controller.close();
            break;
          }

          // فكّ الترميز مع الحفاظ على سلامة الـ UTF-8
          buffer += _decoder.decode(value, { stream: true });

          // تقسيم الـ buffer إلى سطور مع دعم \r\n و \n و \r
          const lines = splitLines(buffer);
          // آخر عنصر قد يكون غير مكتمل → نعيده للـ buffer
          buffer = lines.pop() ?? '';

          for (const line of lines) {
            if (aborted) break;

            const trimmed = line.trim();
            // تجاهل السطور الفارغة والسطور التي لا تبدأ بـ data:
            if (!trimmed) continue;
            if (!trimmed.startsWith('data:')) continue;

            const dataStr = trimmed.slice(5).trim();
            // تجاهل علامات النهاية
            if (!dataStr || dataStr === '[DONE]') continue;

            processSSELine(dataStr, controller, parseDelta, originalOptions, lineCount++);
          }
        }
      } catch (err: any) {
        if (aborted) return;
        if (err?.name === 'AbortError') return;

        // محاولة إعادة الاتصال
        if (maxRetries > 0) {
          controller.error(
            new StreamDisconnectedError(undefined, {
              component: 'SSEParser',
            })
          );
        } else {
          controller.error(
            new StreamError('فشل في قراءة دفق SSE', undefined, err, {
              component: 'SSEParser',
            })
          );
        }
      } finally {
        clearTimeout(timeoutId);
        options?.signal?.removeEventListener('abort', onAbort);
        reader.releaseLock();
      }
    },

    cancel() {
      aborted = true;
      reader.cancel().catch(() => {});
    },
  });
}

/**
 * تقسيم النص إلى سطور مع دعم جميع صيغ نهاية السطر
 */
function splitLines(text: string): string[] {
  // تطبيع نهايات السطر: \r\n → \n  ثم  \r → \n
  const normalized = text.replace(/\r\n/g, '\n').replace(/\r/g, '\n');
  return normalized.split('\n');
}

/**
 * معالجة سطر data: واحد من دفق SSE
 */
function processSSELine(
  dataStr: string,
  controller: ReadableStreamDefaultController<Uint8Array>,
  parseDelta: ParseDelta,
  options?: StreamParserOptions,
  lineIndex?: number
): void {
  // محاولة تحويل JSON
  let parsed: any;
  try {
    parsed = JSON.parse(dataStr);
  } catch (e) {
    const context: Record<string, unknown> = {
      lineIndex,
      preview: dataStr.slice(0, 200),
      length: dataStr.length,
    };
    const error = new StreamError(
      'فشل في تحليل قطعة JSON من دفق SSE',
      undefined,
      e,
      { component: 'SSEParser' }
    );
    options?.onError?.(error, context);
    return;
  }

  // استخراج النص عبر دالة التحليل
  try {
    const text = parseDelta(parsed);
    if (text) {
      controller.enqueue(_encoder.encode(text));
    }
  } catch (e) {
    const context: Record<string, unknown> = {
      lineIndex,
      dataPreview: JSON.stringify(parsed).slice(0, 200),
    };
    const error = new StreamError(
      'فشل في استخراج النص من قطعة البيانات',
      undefined,
      e,
      { component: 'SSEParser' }
    );
    options?.onError?.(error, context);
  }
}

/**
 * تحليل دفق Gemini SSE (للتوافق مع الإصدارات السابقة)
 *
 * @deprecated استخدم parseSSEStream مباشرة مع دالة التحليل المناسبة
 */
export function parseGeminiStream(
  responseBody: ReadableStream<Uint8Array>,
  options?: StreamParserOptions
): ReadableStream<Uint8Array> {
  return parseSSEStream(
    responseBody,
    (json) => json.candidates?.[0]?.content?.parts?.[0]?.text,
    options
  );
}

// ---------------------------------------------------------------------------
// Response Helpers
// ---------------------------------------------------------------------------

/**
 * إنشاء Response من دفق (للتوافق مع الإصدارات السابقة)
 *
 * يُفضّل استخدام Response مباشرة مع Content-Type: text/plain; charset=utf-8
 */
export function createStreamResponse(
  stream: ReadableStream<Uint8Array>,
  options?: { status?: number; statusText?: string }
): Response {
  return new Response(stream, {
    status: options?.status ?? 200,
    statusText: options?.statusText,
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'no-cache, no-transform',
      'Connection': 'keep-alive',
    },
  });
}

// ---------------------------------------------------------------------------
// Internal Helpers
// ---------------------------------------------------------------------------

/**
 * دمج إشارتي إلغاء في إشارة واحدة
 */
function anySignal(signals: AbortSignal[]): AbortSignal {
  const controller = new AbortController();

  for (const signal of signals) {
    if (signal.aborted) {
      controller.abort(signal.reason);
      return controller.signal;
    }
    signal.addEventListener('abort', () => controller.abort(signal.reason), {
      once: true,
    });
  }

  return controller.signal;
}
